import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/server';

export interface WormBlock {
    index: number;
    id: string;
    tenant_id: string | null;
    user_email: string | null;
    action: string;
    table_name: string | null;
    record_id: string | null;
    severity: string;
    timestamp: string;
    prev_hash: string;
    hash: string;
}

export interface VerificationResult {
    isValid: boolean;
    totalBlocks: number;
    tamperedBlockIndices: number[];
    mismatchedDbLogs: string[]; // UUIDs of logs modified or missing
    lastSyncedIndex: number;
    lastSyncedAt: string | null;
    status: 'SECURE' | 'TAMPERED' | 'OUT_OF_SYNC';
}

const BUCKET_NAME = 'security-vault';
const FILE_NAME = 'immutable_ledger.json';

const VAULT_DIR = path.join(process.cwd(), 'storage', 'worm_vault');
const LEDGER_PATH = path.join(VAULT_DIR, FILE_NAME);
const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

// Ensure local directory exists for fallback
function ensureVaultDir() {
    try {
        if (!fs.existsSync(VAULT_DIR)) {
            fs.mkdirSync(VAULT_DIR, { recursive: true });
        }
    } catch {}
}

// Calculate block hash
export function calculateBlockHash(block: Omit<WormBlock, 'hash'>): string {
    const dataString = [
        block.index,
        block.id,
        block.tenant_id || 'null',
        block.user_email || 'null',
        block.action,
        block.table_name || 'null',
        block.record_id || 'null',
        block.severity || 'info',
        block.timestamp,
        block.prev_hash
    ].join('|');
    
    return crypto.createHash('sha256').update(dataString).digest('hex');
}

// Ensure Supabase Storage bucket exists
async function ensureStorageBucket(supabase: any) {
    try {
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();
        if (listError) throw listError;
        
        const exists = buckets?.some((b: any) => b.name === BUCKET_NAME);
        if (!exists) {
            console.log(`[WORM Vault] Creating private bucket: ${BUCKET_NAME}`);
            const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
                public: false,
                fileSizeLimit: 52428800 // 50MB
            });
            if (createError) throw createError;
        }
    } catch (e) {
        console.error('[WORM Vault] Error checking/creating bucket:', e);
    }
}

// Load ledger from Supabase Storage (with physical local WORM fallback)
export async function loadWormLedger(): Promise<WormBlock[]> {
    // 1. Try downloading from Supabase Storage first
    try {
        const supabase = await createAdminClient();
        await ensureStorageBucket(supabase);
        
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .download(FILE_NAME);
            
        if (!error && data) {
            const text = await data.text();
            return JSON.parse(text) as WormBlock[];
        }
        
        if (error && (error as any).status !== 404) {
            console.warn('[WORM Vault] Supabase Storage download error, trying local fallback:', error);
        }
    } catch (storageErr) {
        console.warn('[WORM Vault] Supabase Storage connection failed, trying local fallback:', storageErr);
    }

    // 2. Fallback read from local file system (dev environment support)
    try {
        ensureVaultDir();
        if (fs.existsSync(LEDGER_PATH)) {
            const fileContent = fs.readFileSync(LEDGER_PATH, 'utf-8');
            return JSON.parse(fileContent) as WormBlock[];
        }
    } catch (localErr) {
        console.error('[WORM Vault] Error reading local ledger fallback:', localErr);
    }

    return [];
}

// Write ledger to Supabase Storage (with physical local WORM fallback)
export async function saveWormLedger(ledger: WormBlock[]) {
    const ledgerJSON = JSON.stringify(ledger, null, 2);

    // 1. Save to Supabase Storage first
    try {
        const supabase = await createAdminClient();
        await ensureStorageBucket(supabase);
        
        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(FILE_NAME, ledgerJSON, {
                contentType: 'application/json',
                upsert: true
            });
            
        if (error) {
            console.warn('[WORM Vault] Supabase Storage upload failed, trying local fallback:', error);
        } else {
            console.log('[WORM Vault] Successfully saved ledger to Supabase Storage.');
        }
    } catch (storageErr) {
        console.warn('[WORM Vault] Supabase Storage connection failed for write, trying local fallback:', storageErr);
    }

    // 2. Fallback local write
    try {
        ensureVaultDir();
        if (fs.existsSync(LEDGER_PATH)) {
            try {
                fs.chmodSync(LEDGER_PATH, 0o666); // Writeable
            } catch {}
        }
        
        fs.writeFileSync(LEDGER_PATH, ledgerJSON, 'utf-8');
        
        try {
            fs.chmodSync(LEDGER_PATH, 0o444); // Read-only
        } catch {}
    } catch (localErr) {
        console.warn('[WORM Vault] Local fallback write skipped (expected on Serverless/Vercel):', (localErr as any).message);
    }
}

// Sync Postgres Audit Logs to WORM vault
export async function syncAuditLogsToWorm(): Promise<{ syncedCount: number; totalBlocks: number }> {
    const supabase = (await createAdminClient()) as any;
    const ledger = await loadWormLedger();
    
    // Find the last synchronized timestamp in the Ledger
    let lastSyncedTimestamp = '1970-01-01T00:00:00.000Z';
    if (ledger.length > 0) {
        lastSyncedTimestamp = ledger[ledger.length - 1].timestamp;
    }
    
    let syncedCount = 0;
    const batchSize = 1000; // Page 1000 records per batch to avoid OOM
    let hasMore = true;
    let currentCursor = lastSyncedTimestamp;

    while (hasMore) {
        // Only fetch new logs with created_at greater than last block
        const { data: dbLogs, error } = await supabase
            .from('audit_logs')
            .select('*')
            .gt('created_at', currentCursor)
            .order('created_at', { ascending: true })
            .limit(batchSize);
            
        if (error) {
            throw new Error(`Database error fetching audit logs: ${error.message}`);
        }
        
        const logs = dbLogs || [];
        if (logs.length === 0) {
            hasMore = false;
            break;
        }
        
        const ledgerLogIds = new Set(ledger.map(b => b.id));
        
        for (const log of logs) {
            if (!ledgerLogIds.has(log.id)) {
                const index = ledger.length + 1;
                const prev_hash = ledger.length > 0 ? ledger[ledger.length - 1].hash : GENESIS_HASH;
                
                const newBlock: Omit<WormBlock, 'hash'> = {
                    index,
                    id: log.id,
                    tenant_id: log.tenant_id,
                    user_email: log.user_email,
                    action: log.action,
                    table_name: log.table_name,
                    record_id: log.record_id,
                    severity: log.severity || 'info',
                    timestamp: new Date(log.created_at).toISOString(),
                    prev_hash
                };
                
                const hash = calculateBlockHash(newBlock);
                ledger.push({ ...newBlock, hash });
                syncedCount++;
            }
            // Move cursor to the current log
            currentCursor = log.created_at;
        }

        // If fetched count is less than batch size, new logs are exhausted
        if (logs.length < batchSize) {
            hasMore = false;
        }
    }
    
    if (syncedCount > 0) {
        await saveWormLedger(ledger);
    }
    
    return {
        syncedCount,
        totalBlocks: ledger.length
    };
}

// Perform a cryptographically verified security audit on the logs
export async function verifyWormLedgerIntegrity(): Promise<VerificationResult> {
    const ledger = await loadWormLedger();
    const result: VerificationResult = {
        isValid: true,
        totalBlocks: ledger.length,
        tamperedBlockIndices: [],
        mismatchedDbLogs: [],
        lastSyncedIndex: ledger.length,
        lastSyncedAt: ledger.length > 0 ? ledger[ledger.length - 1].timestamp : null,
        status: 'SECURE'
    };
    
    // 1. Verify cryptographic hash chain inside the ledger
    let expectedPrevHash = GENESIS_HASH;
    for (let i = 0; i < ledger.length; i++) {
        const block = ledger[i];
        
        // Check hash chain linkage
        if (block.prev_hash !== expectedPrevHash) {
            result.isValid = false;
            result.tamperedBlockIndices.push(block.index);
        }
        
        // Re-compute and verify the block hash
        const computedHash = calculateBlockHash({
            index: block.index,
            id: block.id,
            tenant_id: block.tenant_id,
            user_email: block.user_email,
            action: block.action,
            table_name: block.table_name,
            record_id: block.record_id,
            severity: block.severity,
            timestamp: block.timestamp,
            prev_hash: block.prev_hash
        });
        
        if (block.hash !== computedHash) {
            result.isValid = false;
            if (!result.tamperedBlockIndices.includes(block.index)) {
                result.tamperedBlockIndices.push(block.index);
            }
        }
        
        expectedPrevHash = block.hash;
    }
    
    // 2. Cross-verify against active Database audit logs
    const supabase = (await createAdminClient()) as any;
    const { data: dbLogs } = await supabase
        .from('audit_logs')
        .select('id, tenant_id, user_email, action, table_name, record_id, severity, created_at')
        .order('created_at', { ascending: true });
        
    const dbLogsMap = new Map<string, any>((dbLogs || []).map((l: any) => [l.id, l]));
    
    for (const block of ledger) {
        const dbLog = dbLogsMap.get(block.id);
        
        if (!dbLog) {
            // Log was deleted from DB (Trigger bypassed or direct DB intervention!)
            result.isValid = false;
            result.mismatchedDbLogs.push(block.id);
            continue;
        }
        
        // Verify database fields match what is written inside immutable WORM block
        const fieldsMatch = 
            dbLog.action === block.action &&
            (dbLog.tenant_id || null) === (block.tenant_id || null) &&
            (dbLog.user_email || null) === (block.user_email || null) &&
            (dbLog.table_name || null) === (block.table_name || null) &&
            (dbLog.record_id || null) === (block.record_id || null) &&
            (dbLog.severity || 'info') === (block.severity || 'info');
            
        if (!fieldsMatch) {
            // Log fields were modified in Database (Trigger bypassed or direct DB update!)
            result.isValid = false;
            result.mismatchedDbLogs.push(block.id);
        }
    }
    
    // Determine overall status
    if (!result.isValid) {
        result.status = 'TAMPERED';
    } else {
        const dbLogIds = new Set<string>((dbLogs || []).map((l: any) => l.id));
        const ledgerLogIds = new Set<string>(ledger.map(b => b.id));
        
        // Check if DB has new logs that are not synced yet
        const hasUnsynced = Array.from(dbLogIds).some((id: string) => !ledgerLogIds.has(id));
        if (hasUnsynced) {
            result.status = 'OUT_OF_SYNC';
        } else {
            result.status = 'SECURE';
        }
    }
    
    return result;
}

// Tamper simulation utility (for verification & demonstrations)
export async function simulateWormTampering(blockIndex: number, newActionValue: string): Promise<{ success: boolean; message: string }> {
    const ledger = await loadWormLedger();
    if (blockIndex <= 0 || blockIndex > ledger.length) {
        return { success: false, message: 'Invalid block index' };
    }
    
    // Break the chain deliberately by editing a field without updating the hash chain!
    const targetBlock = ledger[blockIndex - 1];
    targetBlock.action = newActionValue;
    
    await saveWormLedger(ledger);
    return {
        success: true,
        message: `DELIBERATELY TAMPERED with Block #${blockIndex}. The cryptographic chain integrity is now broken.`
    };
}

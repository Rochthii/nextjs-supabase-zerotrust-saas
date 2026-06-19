import { redisClient } from './redis-client';

export interface DefenseCheckResult {
    isIpBlocked: boolean;
    isSuspended: boolean;
    allowedIps: string[] | null;
    blockReason: string;
}

/**
 * Edge Defense Engine
 * - Check IP Blocklist (Global SOAR)
 * - Check Tenant Config (Intranet Lockdown, Lifecycle Status)
 * - Use Redis as high-speed Edge Cache, support Negative Caching, and Fallback to Supabase REST API.
 */
export async function checkEdgeDefense(
    clientIp: string,
    hostname: string,
    supabaseUrl?: string,
    supabaseAnonKey?: string
): Promise<DefenseCheckResult> {
    let allowedIps: string[] | null = null;
    let isSuspended = false;
    let isIpBlocked = false;
    let blockReason = '';

    if (hostname === 'localhost:3000') {
        return { isIpBlocked, isSuspended, allowedIps, blockReason };
    }

    try {
        // --- STEP A: CHECK IP BLOCKLIST (GLOBAL SOAR) ---
        const redisBlockKey = `blocklist:${clientIp}`;
        const cachedBlock = await redisClient.get<any>(redisBlockKey);

        if (cachedBlock !== null) {
            // If cache hit
            if (cachedBlock !== false && typeof cachedBlock === 'object') {
                isIpBlocked = true;
                blockReason = cachedBlock.reason || 'Banned by SOAR Active Defense';
            }
            // If cachedBlock === false, IP is safe (Negative Cache Hit), skip DB check.
        } else if (supabaseUrl && supabaseAnonKey) {
            // Cache miss -> Fallback to Postgres query and write back to Redis cache
            const nowIso = new Date().toISOString();
            const blockFetchUrl = `${supabaseUrl}/rest/v1/blocked_ips?ip=eq.${clientIp}&blocked_until=gt.${nowIso}&select=reason,blocked_until`;
            const blockRes = await fetch(blockFetchUrl, {
                headers: {
                    'apikey': supabaseAnonKey,
                    'Authorization': `Bearer ${supabaseAnonKey}`
                }
            });

            if (blockRes.ok) {
                const blockData = await blockRes.json();
                if (blockData && blockData.length > 0) {
                    isIpBlocked = true;
                    blockReason = blockData[0].reason || '';
                    
                    // Calculate remaining TTL for accurate Redis sync
                    const blockedUntil = blockData[0].blocked_until ? new Date(blockData[0].blocked_until) : null;
                    let ttl: number | undefined;
                    if (blockedUntil) {
                        const diffMs = blockedUntil.getTime() - Date.now();
                        ttl = diffMs > 0 ? Math.ceil(diffMs / 1000) : undefined;
                    }
                    
                    // If not in cloud mode (local RAM execution), limit TTL to max 10 seconds to prevent desync between Vercel instances
                    if (!redisClient.isCloudMode() && ttl && ttl > 10) {
                        ttl = 10;
                    }
                    
                    await redisClient.set(redisBlockKey, { reason: blockReason, blocked_until: blockData[0].blocked_until }, { ex: ttl });
                } else {
                    // Negative Caching: safe IP, cache 'false' for 15s to block DDoS DB spamming
                    await redisClient.set(redisBlockKey, false, { ex: 15 });
                }
            }
        }

        // --- STEP B: CHECK TENANT CONFIG (INTRANET LOCKDOWN) ---
        if (!isIpBlocked) {
            const redisTenantKey = `tenant:${hostname}`;
            const cachedTenant = await redisClient.get<any>(redisTenantKey);

            if (cachedTenant !== null) {
                // Cache hit
                if (cachedTenant !== false && typeof cachedTenant === 'object') {
                    if (cachedTenant.lifecycle_status === 'suspended') {
                        isSuspended = true;
                    }
                    if (cachedTenant.ip_whitelist) {
                        allowedIps = cachedTenant.ip_whitelist.split(',').map((ip: string) => ip.trim()).filter(Boolean);
                    }
                }
                // If cachedTenant === false, tenant does not exist, skip DB check.
            } else if (supabaseUrl && supabaseAnonKey) {
                // Cache miss -> Call secure RPC and write back to Redis cache
                const fetchUrl = `${supabaseUrl}/rest/v1/rpc/get_tenant_routing_config`;
                const dbRes = await fetch(fetchUrl, {
                    method: 'POST',
                    headers: {
                        'apikey': supabaseAnonKey,
                        'Authorization': `Bearer ${supabaseAnonKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ p_hostname: hostname })
                });

                if (dbRes.ok) {
                    const tenant = await dbRes.json();
                    if (tenant) {
                        const ipWhitelistStr = tenant.ip_whitelist || null;
                        
                        const tenantConfig = {
                            id: tenant.id,
                            domain: tenant.domain,
                            lifecycle_status: tenant.lifecycle_status,
                            ip_whitelist: ipWhitelistStr
                        };

                        if (tenant.lifecycle_status === 'suspended') {
                            isSuspended = true;
                        }
                        if (ipWhitelistStr) {
                            allowedIps = ipWhitelistStr.split(',').map((ip: string) => ip.trim()).filter(Boolean);
                        }

                        // Write cache for both domain and ID for 10 minutes (600 seconds)
                        // If not in cloud mode (local RAM execution), limit TTL to max 10 seconds to prevent desync
                        const tenantTtl = redisClient.isCloudMode() ? 600 : 10;
                        await redisClient.set(redisTenantKey, tenantConfig, { ex: tenantTtl });
                        await redisClient.set(`tenant:${tenant.id}`, tenantConfig, { ex: tenantTtl });
                    } else {
                        // Negative Caching: tenant does not exist, cache 'false' for 30s to prevent subdomain brute force
                        await redisClient.set(redisTenantKey, false, { ex: 30 });
                    }
                }
            }
        }
    } catch (err) {
        console.error('[Edge Defense] Error in Edge security resolution via Redis Edge Cache:', err);
    }

    return {
        isIpBlocked,
        isSuspended,
        allowedIps,
        blockReason
    };
}

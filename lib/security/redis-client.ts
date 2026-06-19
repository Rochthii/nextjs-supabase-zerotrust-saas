import { Redis } from '@upstash/redis';

// Standard Interface for Redis Client
export interface IRedisClient {
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: any, options?: { ex?: number }): Promise<'OK' | null>;
    del(key: string): Promise<number>;
    isCloudMode(): boolean;
}

// 1. In-Memory Cache with TTL support simulating Redis for local dev
class LocalMemoryCache implements IRedisClient {
    private cache = new Map<string, { value: any; expireAt: number | null }>();

    constructor() {
        console.warn(
            '[Redis Client] ⚠️ Upstash Redis configuration not found. System is automatically falling back to Local Memory Cache.'
        );
    }

    async get<T>(key: string): Promise<T | null> {
        const item = this.cache.get(key);
        if (!item) return null;

        // Check TTL expiration
        if (item.expireAt !== null && Date.now() > item.expireAt) {
            this.cache.delete(key);
            return null;
        }

        // Deep copy to avoid mutating raw data in RAM
        return typeof item.value === 'object' ? JSON.parse(JSON.stringify(item.value)) : item.value;
    }

    async set(key: string, value: any, options?: { ex?: number }): Promise<'OK'> {
        const expireAt = options?.ex ? Date.now() + options.ex * 1000 : null;
        this.cache.set(key, { value, expireAt });
        return 'OK';
    }

    async del(key: string): Promise<number> {
        const existed = this.cache.has(key);
        this.cache.delete(key);
        return existed ? 1 : 0;
    }

    isCloudMode(): boolean {
        return false;
    }
}

// 2. Upstash Redis Wrapper connecting to actual Cloud
class UpstashRedisClient implements IRedisClient {
    private redis: Redis;

    constructor(url: string, token: string) {
        this.redis = new Redis({
            url,
            token,
        });
        console.log('[Redis Client] 🚀 Connected successfully to Upstash Redis Cloud.');
    }

    async get<T>(key: string): Promise<T | null> {
        try {
            return await this.redis.get<T>(key);
        } catch (err) {
            console.error(`[Redis Client] Error GET key ${key}:`, err);
            return null;
        }
    }

    async set(key: string, value: any, options?: { ex?: number }): Promise<'OK' | null> {
        try {
            if (options?.ex) {
                return await this.redis.set(key, value, { ex: options.ex });
            }
            return await this.redis.set(key, value);
        } catch (err) {
            console.error(`[Redis Client] Error SET key ${key}:`, err);
            return null;
        }
    }

    async del(key: string): Promise<number> {
        try {
            return await this.redis.del(key);
        } catch (err) {
            console.error(`[Redis Client] Error DEL key ${key}:`, err);
            return 0;
        }
    }

    isCloudMode(): boolean {
        return true;
    }
}

// 3. Singleton Factory to initialize Client suitable for environment
const getRedisClient = (): IRedisClient => {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (url && token && url.startsWith('http')) {
        return new UpstashRedisClient(url, token);
    }

    return new LocalMemoryCache();
};

export const redisClient = getRedisClient();
export default redisClient;

import { redis } from '@/lib/redis'

const DEFAULT_TTL = 60

export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const cached = await redis.get<string>(key)
    if (!cached) return null
    if (typeof cached === 'object') return cached as T
    return JSON.parse(cached as string) as T
  } catch {
    return null
  }
}

export async function setCached<T>(
  key: string,
  value: T,
  ttlSeconds: number = DEFAULT_TTL
): Promise<void> {
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(value))
  } catch {
    // Silently fail - cache miss is acceptable
  }
}

export async function invalidateCache(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  } catch {
    // Silently fail
  }
}

export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = DEFAULT_TTL
): Promise<T> {
  const cached = await getCached<T>(key)
  if (cached !== null) return cached

  const fresh = await fetcher()
  await setCached(key, fresh, ttlSeconds)
  return fresh
}

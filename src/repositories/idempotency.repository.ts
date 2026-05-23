import { redis } from '@/lib/redis'

const TTL_SECONDS = 86_400 // 24 hours

type CachedResponse = { statusCode: number; body: unknown }

export async function getIdempotentResponse(
  key: string,
  endpoint: string
): Promise<CachedResponse | null> {
  const cached = await redis.get<string>(`idempotency:${endpoint}:${key}`)

  if (!cached) return null

  try {
    return JSON.parse(cached) as CachedResponse
  } catch {
    return null
  }
}

export async function saveIdempotentResponse(
  key: string,
  endpoint: string,
  statusCode: number,
  body: unknown
): Promise<void> {
  await redis.setex(
    `idempotency:${endpoint}:${key}`,
    TTL_SECONDS,
    JSON.stringify({ statusCode, body })
  )
}

import { z } from 'zod'

export const IdParamSchema = z.object({
  id: z.string().cuid({ message: 'Invalid ID format' }),
})

export const EnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url(),
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
  CRON_SECRET: z.string().min(32),
})

export type IdParam = z.infer<typeof IdParamSchema>

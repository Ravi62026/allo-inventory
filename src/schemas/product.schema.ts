import { z } from 'zod'

export const ProductQuerySchema = z.object({
  warehouseId: z.string().cuid().optional(),
  category: z.string().optional(),
  inStockOnly: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
})

export type ProductQuery = z.infer<typeof ProductQuerySchema>

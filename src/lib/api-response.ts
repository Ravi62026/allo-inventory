import { AppError } from './errors'
import { ZodError } from 'zod'

export type ApiSuccess<T> = { success: true; data: T }
export type ApiError = { success: false; error: { code: string; message: string; details?: unknown } }

export function ok<T>(data: T, status = 200): Response {
  return Response.json({ success: true, data } satisfies ApiSuccess<T>, { status })
}

export function err(code: string, message: string, status: number, details?: unknown): Response {
  return Response.json(
    { success: false, error: { code, message, ...(details ? { details } : {}) } } satisfies ApiError,
    { status }
  )
}

export function handleError(error: unknown): Response {
  if (error instanceof AppError) {
    return err(error.code, error.message, error.statusCode)
  }

  if (error instanceof ZodError) {
    return err('VALIDATION_ERROR', 'Invalid request data', 400, error.flatten())
  }

  console.error('[API Error]', error)
  return err('INTERNAL_ERROR', 'An unexpected error occurred', 500)
}

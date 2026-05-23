export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class InsufficientStockError extends AppError {
  constructor() {
    super('INSUFFICIENT_STOCK', 'Not enough units available to fulfill this reservation', 409)
  }
}

export class ReservationExpiredError extends AppError {
  constructor() {
    super('RESERVATION_EXPIRED', 'This reservation has expired', 410)
  }
}

export class ReservationNotFoundError extends AppError {
  constructor() {
    super('NOT_FOUND', 'Reservation not found', 404)
  }
}

export class InvalidStatusTransitionError extends AppError {
  constructor(from: string, to: string) {
    super(
      'INVALID_STATUS_TRANSITION',
      `Cannot transition reservation from ${from} to ${to}`,
      409
    )
  }
}

export class DuplicateIdempotencyKeyError extends AppError {
  constructor() {
    super('IDEMPOTENCY_CONFLICT', 'Request with this Idempotency-Key is already processing', 409)
  }
}

export class DuplicateEmailError extends AppError {
  constructor() {
    super('DUPLICATE_EMAIL', 'An account with this email already exists', 409)
  }
}

export class InvalidCredentialsError extends AppError {
  constructor() {
    super('INVALID_CREDENTIALS', 'Invalid email or password', 401)
  }
}

export class UnauthorizedError extends AppError {
  constructor() {
    super('UNAUTHORIZED', 'Authentication required', 401)
  }
}

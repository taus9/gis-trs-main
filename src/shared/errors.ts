export class AppError extends Error {
  public status: number;
  public details?: unknown;

  constructor(message: string, status = 500, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.details = details;
  }
}

export class HttpError extends AppError {
  constructor(message: string, status: number, details?: unknown) {
    super(message, status, details);
    this.name = "HttpError";
  }
}

export class ValidationError extends HttpError {
  constructor(message = "Validation failed", details?: unknown) {
    super(message, 400, details);
    this.name = "ValidationError";
  }
}
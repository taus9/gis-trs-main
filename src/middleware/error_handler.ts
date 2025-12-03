import type { Context, Next } from "@oak";
import { ZodError } from "@zod";
import { AppError } from "../shared/errors.ts";

/**
 * Global error-handling middleware for Oak.
 * - Catches thrown errors (including ZodError).
 * - Logs server-side (replace console methods with your logger).
 * - Returns consistent JSON error responses.
 */
export async function errorHandler(ctx: Context, next: Next) {
  try {
    await next();
    // If no route matched, return 404 in a consistent JSON shape
    if (ctx.response.status === 404 && !ctx.response.body) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Not Found" };
    }
  } catch (err) {
    // Zod errors -> 400 with details
    if (err instanceof ZodError) {
      const details = err.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      }));
      // Log server-side
      console.warn("Validation error:", details);
      ctx.response.status = 400;
      ctx.response.body = { error: "Validation failed", details };
      return;
    }

    // App-level errors with status
    if (err instanceof AppError) {
      console.warn("Handled error:", { message: err.message, status: err.status, details: err.details });
      ctx.response.status = err.status;
      ctx.response.body = { error: err.message, details: err.details ?? undefined };
      return;
    }

    // Unknown / unhandled errors -> 500
    console.error("Unhandled error:", err);
    ctx.response.status = 500;
    ctx.response.body = { error: "Internal Server Error" };
  }
}
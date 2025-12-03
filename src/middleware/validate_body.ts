import type { Context, Next } from "@oak";
import type { ZodSchema } from "@zod";
import { ValidationError } from "../shared/errors.ts";

/**
 * validateBody(schema) -> Oak middleware
 * - Reads JSON body
 * - Parses and validates with provided Zod schema
 * - On success attaches parsed value to ctx.state.validatedBody
 * - On failure throws ValidationError (handled by error_handler)
 */
export function validateBody(schema: ZodSchema) {
  return async (ctx: Context, next: Next) => {

    const contentType = ctx.request.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      // Throwing here is fine — global handler will convert to a response
      throw new ValidationError("Expected application/json content-type");
    }

    // read body (may throw if body parsing fails; let the global handler catch it)
    const body = await ctx.request.body({ type: "json" }).value;

    // safeParse avoids try/catch and gives you the error object to shape
    const parseResult = schema.safeParse(body);
    if (!parseResult.success) {
      const details = parseResult.error.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      }));
      // Throw a ValidationError with details — global middleware will map this to 400
      throw new ValidationError("Validation failed", details);
    }

    // Attach typed validated data to state for handlers
    // (Prefer typing ctx.state globally in your app so this is strongly typed)
    ctx.state.validatedBody = body;

    await next();
  };
}
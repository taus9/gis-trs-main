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
        throw new ValidationError(
            "Validation failed",
            [{ contentType: contentType, message: "Expected application/json" }]
        );
    }

    // read body (may throw if body parsing fails; let the global handler catch it)
    const body = await ctx.request.body({ type: "json" }).value;

    const parseResult = schema.safeParse(body);
    if (!parseResult.success) {
        const details = parseResult.error.errors.map((e) => ({
            path: e.path.join("."),
            message: e.message,
        }));

        throw new ValidationError("Validation failed", details);
    }

    ctx.state.validatedBody = body;

    await next();
  };
}
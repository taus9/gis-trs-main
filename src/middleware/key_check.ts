// src/middleware/api-key-check.ts
import { Context } from "@oak";
import { UserStore } from "../interfaces/user.ts";
import { AppError } from "../shared/errors.ts";

/**
 * Factory to create API key authentication middleware for Oak.
 * @param userStore - Provides access to stored user records for validation
 * @returns Middleware function that enforces API key checks on incoming requests
*/
export function createKeyCheckMiddleware(userStore: UserStore) 
{
    return async (ctx: Context, next: () => Promise<unknown>) => {
        // Extract the API key and user ID from request headers
        const suppliedKey = ctx.request.headers.get("gis-api-key");
        const suppliedId = ctx.request.headers.get("gis-user-id");

        // Reject requests missing either header
        if (!suppliedKey || !suppliedId) {
            //TODO: Implement a custom error class for this middleware
            // provide more details like which header is missing
            throw new AppError("Unauthorized request", 401);
        }

        // Lookup the user record by user ID
        const user = await userStore.get(suppliedId);

        // Reject if user not found or API key mismatch
        if (!user || user.api_key !== suppliedKey) {
            //TODO: Implement a custom error class for this middleware
            // provide more details like whether user not found or key mismatch
            throw new AppError("Unauthorized", 401);
        }

        ctx.state.user_id = suppliedId;
        // All checks passed: forward to the next middleware or route handler
        await next();
    };
}

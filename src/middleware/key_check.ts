// src/middleware/api-key-check.ts
import { Context } from "@oak";
import { UserStore } from "../interfaces/user.ts";

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
            console.error("Unauthorized request: missing headers");
            ctx.response.status = 401;
            ctx.response.body = { error: "Unauthorized" };
            return;
        }

        try {
            // Lookup the user record by user ID
            const user = await userStore.get(suppliedId);

            // Reject if user not found or API key mismatch
            if (!user || user.api_key !== suppliedKey) {
                console.error("Unauthorized request: invalid credentials", {
                    user_id: suppliedId,
                    api_key: suppliedKey,
                });
                ctx.response.status = 401;
                ctx.response.body = { error: "Unauthorized" };
                return;
            }
        } catch (err) {
            // Handle unexpected errors from the store
            console.error("API key check error:", err);
            ctx.response.status = 500;
            ctx.response.body = { error: "Internal server error" };
            return;
        }

        ctx.state.user_id = suppliedId;
        // All checks passed: forward to the next middleware or route handler
        await next();
    };
}

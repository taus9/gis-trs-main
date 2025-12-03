import { Context } from "@oak";
import { z } from "@zod";
import {StoredToken, TokenStore} from "../interfaces/token.ts";
import { tokenRequestSchema } from "../shared/schemas.ts";
import { getTokenFromCode } from "../shared/goto.ts";
import { ConfigShape } from "../shared/config.ts";
import { AppError } from "../shared/errors.ts";

export function createCodeHandler(tokenStore: TokenStore, config: ConfigShape) {
    return async (ctx: Context) => {
        // the user_id was set in createKeyCheckMiddleware
        const user_id = ctx.state.user_id as string;
        // payload was validated in validateBody middleware
        const payload = ctx.state.validatedBody as z.infer<typeof tokenRequestSchema>;
        const response = await getTokenFromCode(payload.code, config);
        if ("access_token" in response) {
            const expires_at = Date.now() + (response.expires_in - config.REFRESH_MARGIN) * 1000;
            const store: StoredToken = {...response, expires_at, user_id};
            await tokenStore.upsert(store);
            console.log("New token from code successful: user_id:", user_id);
            ctx.response.status = 200;
            ctx.response.body = { message: "Token stored" };
        } else {
            //console.error("Error getting token from code:", response.error_description);
            throw new AppError(response.error_description || "Error getting token from code", response.status);
        }
    }
}
import { Context } from "@oak";
import {StoredToken, TokenStore} from "../interfaces/token.ts";
import { tokenRequestSchema } from "../shared/schemas.ts";
import { getTokenFromCode } from "../shared/goto.ts";
import { ConfigShape } from "../shared/env.ts";

export function createCodeHandler(_store: TokenStore, config: ConfigShape) {
    return async (ctx: Context) => {

        try {
            const user_id = ctx.state.user_id as string; // There will always be a valid user id here
            const { value } = ctx.request.body({ type: "json" });
            const { code } = await value;

            const validationResult = tokenRequestSchema.safeParse({ code });

            if (!validationResult.success) {
                console.error("Invalid request:", validationResult.error.flatten().fieldErrors);
                ctx.response.status = 400;
                ctx.response.body = { error: "Invalid request" };
                return;
            }

            const response = await getTokenFromCode(code, config);

            if ("access_token" in response) {
                const expires_at = Date.now() + (response.expires_in - config.REFRESH_MARGIN) * 1000;
                const store: StoredToken = {...response, expires_at, user_id};
                await _store.upsert(store);
                console.log("New token from code successful: user_id:", user_id);
                ctx.response.status = 200;
                ctx.response.body = { message: "Token stored" };
            } else {
                console.error("Error getting token from code:", response.error_description);
                ctx.response.status = response.status;
                ctx.response.body = { error: response.error_description };
            }

        } catch (err) {
            console.error("Route /code error:", err);
            ctx.response.status = 500;
            ctx.response.body = { error: "Internal server error" };
        }

    }
}
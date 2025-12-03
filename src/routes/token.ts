import { Context } from "@oak";
import { TokenStore, StoredToken } from "../interfaces/token.ts";
import { getTokenFromRefresh } from "../shared/goto.ts";
import { ConfigShape } from "../shared/config.ts";
import { AppError } from "../shared/errors.ts";

export function createTokenHandler(tokenStore: TokenStore, config: ConfigShape) {
    return async (ctx: Context) => {
        // user_id was set in createKeyCheckMiddleware
        const user_id = ctx.state.user_id as string;
        
        const userToken = await tokenStore.get(user_id);
        if (!userToken) {
            throw new AppError("User token not found", 404);
        }

        // token is still valid
        if (Date.now() < userToken.expires_at) {
            console.log("Retrieved token for user: ", user_id);
            ctx.response.status = 200;
            ctx.response.body = { access_token: userToken.access_token }
            return;
        }

        // token expired, attempt to refresh
        const response = await getTokenFromRefresh(userToken.refresh_token, config);
        if ("access_token" in response) {
            const expires_at = 
                Date.now() + 
                (response.expires_in - config.REFRESH_MARGIN) * 1000;
            const newUserToken: StoredToken = {
                ...response,
                user_id,
                expires_at,
                refresh_token: response.refresh_token || userToken.refresh_token,
            }
            await tokenStore.upsert(newUserToken);
            console.log("New token from refresh successful: user_id:", user_id);
            ctx.response.status = 200;
            ctx.response.body = { access_token: newUserToken.access_token };
        } else {
            console.error("Error getting token from code:", response.error_description);
            ctx.response.status = response.status;
            ctx.response.body = { error: response.error_description };
        }
    };
}
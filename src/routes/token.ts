import { Context } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { TokenStore, StoredToken } from "../interfaces/token.ts";
import {getTokenFromRefresh} from "../shared/goto.ts";
import getRefreshMargin from "../shared/expiry.ts";

export function createTokenHandler(tokenStore: TokenStore) {

    const REFRESH_MARGIN = getRefreshMargin();

    return async (ctx: Context) => {
        const user_id = ctx.state.user_id as string;

        try {
            const userToken = await tokenStore.get(user_id);

            // could not retrieve token for user,
            if (!userToken) {
                ctx.response.status = 404;
                ctx.response.body = { error: "User token not found" }
                return;
            }

            if (Date.now() < userToken.expires_at) {
                console.log("Retrieved token for user: ", user_id);
                ctx.response.status = 200;
                ctx.response.body = { access_token: userToken.access_token }
                return;
            }

            const response = await getTokenFromRefresh(userToken.refresh_token);

            if ("access_token" in response) {
                const expires_at = Date.now() + (response.expires_in - REFRESH_MARGIN) * 1000;
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

        } catch (_err) {
                console.error("Could not get get user info: ", user_id);
                console.error(_err);
                ctx.response.status = 500;
                ctx.response.body = { error: "Internal server error" };
        }
    };
}
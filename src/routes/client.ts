import { Context } from "@oak";
import { ConfigShape } from "../shared/env.ts";

export function createClientHandler(config: ConfigShape) {

    const client_id = config.GOTO_CLIENT_ID;
    const redirect_uri = config.CLIENT_REDIRECT_URI;
    const response_type = config.GOTO_RESPONSE_TYPE ?? "";
    const scope = config.GOTO_AUTH_SCOPE ?? "";

    return (ctx: Context) => {
        const user_id = ctx.state.user_id as string;
        console.log("Client info requested:", user_id);
        ctx.response.status = 200;
        ctx.response.body = { client_id, redirect_uri, response_type, scope };
        return;
    }

}
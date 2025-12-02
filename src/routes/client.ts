import { Context } from "@oak";
import { EnvShape } from "../shared/env.ts";

export function createClientHandler(env: EnvShape) {

    const client_id = env.GOTO_CLIENT_ID;
    const redirect_uri = env.CLIENT_REDIRECT_URI;
    const response_type = env.GOTO_RESPONSE_TYPE ?? "";
    const scope = env.GOTO_AUTH_SCOPE ?? "";

    return (ctx: Context) => {
        const user_id = ctx.state.user_id as string;
        console.log("Client info requested:", user_id);
        ctx.response.status = 200;
        ctx.response.body = { client_id, redirect_uri, response_type, scope };
        return;
    }

}
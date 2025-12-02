import { Context } from "https://deno.land/x/oak@v12.6.1/mod.ts";

export function createClientHandler() {

    const client_id = Deno.env.get("GOTO_CLIENT_ID") as string;
    const redirect_uri = Deno.env.get("CLIENT_REDIRECT_URI") as string;
    const response_type = Deno.env.get("GOTO_RESPONSE_TYPE") as string;
    const scope = Deno.env.get("GOTO_AUTH_SCOPE") as string;

    return (ctx: Context) => {
        const user_id = ctx.state.user_id as string;
        console.log("Client info requested:", user_id);
        ctx.response.status = 200;
        ctx.response.body = { client_id, redirect_uri, response_type, scope };
        return;
    }

}
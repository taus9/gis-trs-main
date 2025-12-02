import { Token, TokenError } from "../interfaces/token.ts";
import { ConfigShape } from "./config.ts";

export async function getTokenFromCode(code: string, config: ConfigShape) {
    const client_id = config.GOTO_CLIENT_ID;
    const client_secret = config.GOTO_CLIENT_SECRET;
    const redirect_uri = config.CLIENT_REDIRECT_URI;
    const token_endpoint = config.GOTO_TOKEN_ENDPOINT;
    const auth_token = btoa(`${client_id}:${client_secret}`);

    const headers = new Headers({
        "Authorization": `Basic ${auth_token}`,
        "Content-Type": "application/x-www-form-urlencoded"
    });

    const postData = new URLSearchParams({
        grant_type: "authorization_code",
        redirect_uri: redirect_uri,
        client_id: client_id,
        code: code
    });

    const response = await fetch(token_endpoint, {
        method: "POST",
        headers,
        body: postData
    });

    const body = await response.json();

    switch (response.status) {
        case 200:
            return body as Token;
        case 400:
        case 401: {
            const err: TokenError  = {
                status: response.status,
                error_description: body.error_description as string,
            }
            return err
        }
        default: {
            const err: TokenError  = {
                status: response.status,
                error_description: "Unknown error",
            }
            return err;
        }
    }
}

export async function getTokenFromRefresh(refresh_token: string, config: ConfigShape) {
    const client_id = config.GOTO_CLIENT_ID;
    const client_secret = config.GOTO_CLIENT_SECRET;
    const token_endpoint = config.GOTO_TOKEN_ENDPOINT;
    const auth_token = btoa(`${client_id}:${client_secret}`);

    const headers = new Headers({
        "Authorization": `Basic ${auth_token}`,
        "Content-Type": "application/x-www-form-urlencoded"
    });

    const postData = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refresh_token
    });

    const response = await fetch(token_endpoint, {
        method: "POST",
        headers,
        body: postData.toString()
    })

    const body = await response.json();

    console.log("raw response: ", body);

    switch (response.status) {
        case 200:
            // refresh_token won't always have a value, but we don't want to pass it as undefined.
            // if (!body.refresh_token) {
            //     body.refresh_token = "";
            // }
            return body as Token;
        case 400: {
            const err: TokenError  = {
                status: response.status,
                error_description: body.error_description as string,
            }
            return err
        }
        default: {
            const err: TokenError  = {
                status: response.status,
                error_description: "Unknown error",
            }
            return err;
        }
    }
}
import { Context } from "@oak";
import { UserStore } from "../interfaces/user.ts";
import { generateApiKey, generateUserId } from "../shared/keygen.ts";

export function createRegisterHandler(store: UserStore) {
    return async (ctx: Context) => {
        const id = generateUserId();
        const api_key = generateApiKey();
        const created_at = Date.now();

        await store.upsert({ id, api_key, created_at });
        
        console.log("New user registered:", { id, api_key, created_at });
        
        ctx.response.status = 201;
        ctx.response.body = { id, api_key, created_at };
    }
}
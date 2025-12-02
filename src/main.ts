import { Application, Router } from "@oak";
import { oakCors } from "@cors";

import { supabase } from "./shared/supabase.ts";
import { loadConfig } from "./shared/env.ts";

import { SupabaseUserStore } from "./providers/user/supabase.ts";
import { SupabaseTokenStore } from "./providers/token/supabase.ts";
import { MemoryUserStore } from "./providers/user/memory.ts";
import { MemoryTokenStore } from "./providers/token/memory.ts";
import { FileUserStore } from "./providers/user/file.ts";
import { FileTokenStore } from "./providers/token/file.ts";


import { apiKeyCheckMiddleware } from "./middleware/api-key-check.ts";

import { createTokenHandler } from "./routes/token.ts";
import { createCodeHandler } from "./routes/code.ts";
import { createRegisterHandler } from "./routes/register.ts";
import { createClientHandler } from "./routes/client.ts";

import { UserStore } from "./interfaces/user.ts";
import { TokenStore } from "./interfaces/token.ts";

// Load environment variables
// throws error if required variables are missing
const env = loadConfig();

let userStore: UserStore;
let tokenStore: TokenStore;

switch (env.PROVIDER) {
    case "memory":
        userStore = new MemoryUserStore();
        tokenStore = new MemoryTokenStore();
        break;
    case "file":
        userStore = new FileUserStore(".data", "users.json");
        tokenStore = new FileTokenStore(".data", "tokens.json");
        break;
    case "supabase":
    default: {
        const supabaseClient = supabase(env);
        userStore = new SupabaseUserStore(supabaseClient);
        tokenStore = new SupabaseTokenStore(supabaseClient);
        break;
    }
}

const router = new Router();

router.post("/register", createRegisterHandler(userStore));
router.post("/code", createCodeHandler(tokenStore, env));
router.get("/token", createTokenHandler(tokenStore, env));
router.get("/client", createClientHandler(env));

const app = new Application();
app.use(oakCors({
    origin: "chrome-extension://hfeoapcldkocaoikhnhjfhffmlaeccoe",
    methods: ["GET", "POST", "OPTIONS"], // include OPTIONS!
    allowedHeaders: ["Content-Type"],
}));

app.use(apiKeyCheckMiddleware(userStore));

app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: env.PORT });
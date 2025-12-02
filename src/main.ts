import { Application, Router } from "@oak";
import { oakCors } from "@cors";

import { supabase } from "./shared/supabase.ts";
import { loadEnv } from "./shared/env.ts";
import { SupabaseUserStore } from "./providers/user/supabase.ts";
import { SupabaseTokenStore } from "./providers/token/supabase.ts";

import { apiKeyCheckMiddleware } from "./middleware/api-key-check.ts";

import { createTokenHandler } from "./routes/token.ts";
import { createCodeHandler } from "./routes/code.ts";
import { createRegisterHandler } from "./routes/register.ts";
import { createClientHandler } from "./routes/client.ts";

// Load environment variables
// throws error if required variables are missing
const env = loadEnv();

const supabaseClient = supabase(env);
const userStore = new SupabaseUserStore(supabaseClient);
const tokenStore = new SupabaseTokenStore(supabaseClient);

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
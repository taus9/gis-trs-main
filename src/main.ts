import { Application, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";

import { supabase } from "./shared/supabase.ts";
import { SupabaseUserStore } from "./providers/user/supabase.ts";
import { SupabaseTokenStore } from "./providers/token/supabase.ts";

import { apiKeyCheckMiddleware } from "./middleware/api-key-check.ts";

import { createTokenHandler } from "./routes/token.ts";
import { createCodeHandler } from "./routes/code.ts";
import { createRegisterHandler } from "./routes/register.ts";
import { createClientHandler } from "./routes/client.ts";

const supabaseClient = supabase;
const userStore = new SupabaseUserStore(supabaseClient);
const tokenStore = new SupabaseTokenStore(supabaseClient);

const router = new Router();

router.post("/register", createRegisterHandler(userStore));
router.post("/code", createCodeHandler(tokenStore));
router.get("/token", createTokenHandler(tokenStore));
router.get("/client", createClientHandler());

const app = new Application();
app.use(oakCors({
    origin: "chrome-extension://hfeoapcldkocaoikhnhjfhffmlaeccoe",
    methods: ["GET", "POST", "OPTIONS"], // include OPTIONS!
    allowedHeaders: ["Content-Type"],
}));

app.use(apiKeyCheckMiddleware(userStore));

app.use(router.routes());
app.use(router.allowedMethods());

const _port = Number(Deno.env.get("PORT")) || 3000;

await app.listen({ port: _port });
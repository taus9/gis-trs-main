import { supabase } from "./shared/supabase.ts";
import { loadConfig } from "./shared/config.ts";

import { SupabaseUserStore } from "./providers/user/supabase.ts";
import { SupabaseTokenStore } from "./providers/token/supabase.ts";
import { MemoryUserStore } from "./providers/user/memory.ts";
import { MemoryTokenStore } from "./providers/token/memory.ts";
import { FileUserStore } from "./providers/user/file.ts";
import { FileTokenStore } from "./providers/token/file.ts";

import { UserStore } from "./interfaces/user.ts";
import { TokenStore } from "./interfaces/token.ts";
import { createApp } from "./app.ts";

// Load environment variables
// throws error if required variables are missing
const config = loadConfig();

let userStore: UserStore;
let tokenStore: TokenStore;

switch (config.PROVIDER) {
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
        const supabaseClient = supabase(config);
        userStore = new SupabaseUserStore(supabaseClient);
        tokenStore = new SupabaseTokenStore(supabaseClient);
        break;
    }
}

const app = createApp(config, userStore, tokenStore);
console.log(`Starting server on :${config.PORT} (provider=${config.PROVIDER})`);

await app.listen({ port: config.PORT });
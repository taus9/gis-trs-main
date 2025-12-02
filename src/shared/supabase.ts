import { createClient } from "@supabase";

import { EnvShape } from "./env.ts";

export const supabase = (env:EnvShape) => createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
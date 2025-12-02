import { createClient } from "jsr:@supabase/supabase-js@2";

import { EnvShape } from "./env.ts";

export const supabase = (env:EnvShape) => createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
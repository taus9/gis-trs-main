import { createClient } from "@supabase";

import { ConfigShape } from "./env.ts";

export const supabase = (config:ConfigShape) => createClient(config.SUPABASE_URL, config.SUPABASE_KEY);
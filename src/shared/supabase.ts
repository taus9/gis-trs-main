import { createClient } from "@supabase";

import { ConfigShape } from "./config.ts";

export const supabase = (config:ConfigShape) => createClient(config.SUPABASE_URL, config.SUPABASE_KEY);
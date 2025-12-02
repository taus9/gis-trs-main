// Environment loader factory
export type EnvShape = {
	PORT: number;
	SUPABASE_URL: string;
	SUPABASE_KEY: string;
	REFRESH_MARGIN: number;
	PROVIDER: "memory" | "file" | "supabase" | string;
	GOTO_CLIENT_ID: string;
	GOTO_CLIENT_SECRET: string;
	CLIENT_REDIRECT_URI: string;
	GOTO_TOKEN_ENDPOINT: string;
	GOTO_RESPONSE_TYPE?: string;
	GOTO_AUTH_SCOPE?: string;
};

const allowedProviders = new Set(["memory", "file", "supabase"]);


function required(key: string, value: string | undefined): string {
	if (value === undefined || value === "") {
		throw new Error(`Missing required environment variable: ${key}`);
	}
	return value;
}

export function loadEnv(): EnvShape {
	const PORT = Number(Deno.env.get("PORT") ?? "3000");

	const REFRESH_MARGIN = Number(Deno.env.get("REFRESH_MARGIN") ?? "180");

	const PROVIDER_RAW = required("PROVIDER", Deno.env.get("PROVIDER") ?? undefined).toLowerCase();
	if (!allowedProviders.has(PROVIDER_RAW)) {
		throw new Error(
			`Invalid PROVIDER: ${PROVIDER_RAW}. Allowed values are: memory, file, supabase`
		);
	}
	const PROVIDER = PROVIDER_RAW as "memory" | "file" | "supabase";

	const SUPABASE_URL = required("SUPABASE_URL", Deno.env.get("SUPABASE_URL") ?? undefined);
	const SUPABASE_KEY = required("SUPABASE_KEY", Deno.env.get("SUPABASE_KEY") ?? undefined);

	const GOTO_CLIENT_ID = required("GOTO_CLIENT_ID", Deno.env.get("GOTO_CLIENT_ID") ?? undefined);
	const GOTO_CLIENT_SECRET = required("GOTO_CLIENT_SECRET", Deno.env.get("GOTO_CLIENT_SECRET") ?? undefined);
	const CLIENT_REDIRECT_URI = required("CLIENT_REDIRECT_URI", Deno.env.get("CLIENT_REDIRECT_URI") ?? undefined);
	const GOTO_TOKEN_ENDPOINT = required("GOTO_TOKEN_ENDPOINT", Deno.env.get("GOTO_TOKEN_ENDPOINT") ?? undefined);

	const GOTO_RESPONSE_TYPE = Deno.env.get("GOTO_RESPONSE_TYPE") ?? undefined;
	const GOTO_AUTH_SCOPE = Deno.env.get("GOTO_AUTH_SCOPE") ?? undefined;

	return Object.freeze({
		PORT,
		SUPABASE_URL,
		SUPABASE_KEY,
		REFRESH_MARGIN,
		PROVIDER,
		GOTO_CLIENT_ID,
		GOTO_CLIENT_SECRET,
		CLIENT_REDIRECT_URI,
		GOTO_TOKEN_ENDPOINT,
		GOTO_RESPONSE_TYPE,
		GOTO_AUTH_SCOPE,
	});
}
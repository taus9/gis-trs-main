import { Application, Router } from "@oak";
import { oakCors } from "@cors";

import { UserStore } from "./interfaces/user.ts";
import { TokenStore } from "./interfaces/token.ts";

import { ConfigShape } from "./shared/config.ts";

import { createKeyCheckMiddleware } from "./middleware/key_check.ts";

import { createTokenHandler } from "./routes/token.ts";
import { createCodeHandler } from "./routes/code.ts";
import { createRegisterHandler } from "./routes/register.ts";
import { createClientHandler } from "./routes/client.ts";
import { createTestHandler } from "./routes/validate_test_1.ts";
import { validateTestSchema } from "./shared/test_schemas.ts";
import { validateBody } from "./middleware/validate_body.ts";

/**
 * createApp builds and returns a configured Oak Application instance WITHOUT starting the server.
 * This makes the app easy to test (importable) and keeps startup concerns (listen) separate.
 *
 * - config: application configuration (CORS origins, etc.)
 * - stores: concrete implementations of persistence interfaces (injected for testability)
 */
export function createApp(config: ConfigShape, userStore: UserStore, tokenStore: TokenStore): Application {
  if (!userStore || !tokenStore) {
    throw new Error("createApp requires userStore and tokenStore to be provided");
  }

  const app = new Application();

  // Basic structured error handler - normalize errors to JSON responses
  app.use(async (ctx, next) => {
    try {
      await next();
      // Optionally, handle 404s if no route matched
      if (ctx.response.status === 404 && !ctx.response.body) {
        ctx.response.status = 404;
        ctx.response.body = { error: "Not Found" };
      }
    } catch (err) {
      // Log server-side (replace with structured logger as you add one)
      console.error("Unhandled error:", err);
      ctx.response.status = 500;
      ctx.response.body = { error: "Internal Server Error" };
    }
  });

    app.use(oakCors({
        origin: "chrome-extension://hfeoapcldkocaoikhnhjfhffmlaeccoe",
        methods: ["GET", "POST", "OPTIONS"], // include OPTIONS!
        allowedHeaders: ["Content-Type"],
    }));

  // Router and routes
  const router = new Router();

  //router.post("/register", createRegisterHandler(userStore));
  //router.post("/code", createCodeHandler(tokenStore, config));
  //router.get("/token", createTokenHandler(tokenStore, config));
  //router.get("/client", createClientHandler(config));
  router.post("/test", validateBody(validateTestSchema), createTestHandler());

  // Wrap apiKeyCheckMiddleware so we can bypass it for public endpoints
  const bypassPaths = ["/register", "/client", "/test"];
  const apiKeyMiddleware = createKeyCheckMiddleware(userStore);

  app.use(async (ctx, next) => {
    const path = ctx.request.url.pathname;
    if (bypassPaths.includes(path)) {
      return await next();
    }
    // call the api key middleware for protected routes
    return await apiKeyMiddleware(ctx, next);
  });

  app.use(router.routes());
  app.use(router.allowedMethods());

  return app;
}
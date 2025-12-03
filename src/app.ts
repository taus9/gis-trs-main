import { Application, Router } from "@oak";
import { oakCors } from "@cors";

import { UserStore } from "./interfaces/user.ts";
import { TokenStore } from "./interfaces/token.ts";

import { ConfigShape } from "./shared/config.ts";

import { createKeyCheckMiddleware } from "./middleware/key_check.ts";
import { errorHandler } from "./middleware/error_handler.ts";
import { validateBody } from "./middleware/validate_body.ts";

import { createTokenHandler } from "./routes/token.ts";
import { createCodeHandler } from "./routes/code.ts";
import { createRegisterHandler } from "./routes/register.ts";
import { createClientHandler } from "./routes/client.ts";
import { tokenRequestSchema } from "./shared/schemas.ts";

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

  app.use(errorHandler);

  app.use(oakCors({
    origin: "chrome-extension://hfeoapcldkocaoikhnhjfhffmlaeccoe",
    methods: ["GET", "POST", "OPTIONS"], // include OPTIONS!
    allowedHeaders: ["Content-Type"],
  }));

  // Router and routes
  const router = new Router();

  router.post("/register", createRegisterHandler(userStore));
  router.post("/code", createCodeHandler(tokenStore, config));
  router.get("/token", validateBody(tokenRequestSchema), createTokenHandler(tokenStore, config));
  router.get("/client", createClientHandler(config));

  // Wrap apiKeyCheckMiddleware so we can bypass it for public endpoints
  const bypassPaths = ["/register", "/client"];
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
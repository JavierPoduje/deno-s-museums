import {
  Algorithm,
  Application,
  jwtMiddleware,
  oakCors,
  Router,
  // RouterMiddleware,
} from "../deps.ts";
import { MuseumController } from "../museums/index.ts";
import { UserController } from "../users/index.ts";

interface CreateServerDependencies {
  configuration: {
    port: number;
    authorization: {
      key: string;
      algorithm: Algorithm;
    };
    allowedOrigins: string[];
  };
  museum: MuseumController;
  user: UserController;
  secure: boolean;
  keyFile: string;
  certFile: string;
}

export async function createServer({
  configuration: { port, authorization, allowedOrigins },
  museum,
  secure,
  keyFile,
  certFile,
  user,
}: CreateServerDependencies) {
  const app = new Application();

  app.use(async (ctx, next) => {
    await next();
    const rt = ctx.response.headers.get("X-Response-Time");
    console.log(`${ctx.request.method} ${ctx.request.url} - ${rt}`);
  });
  app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.response.headers.set("X-Response-Time", `${ms}ms`);
  });
  app.use(oakCors({ origin: allowedOrigins }));
  const apiRouter = new Router({ prefix: "/api" });

  app.addEventListener("listen", (e) => {
    console.log(
      `Application running at ${e.secure ? "https" : "http"}://${
        e.hostname || `localhost`
      }:${port}`,
    );
  });

  app.addEventListener("error", (e) => {
    console.log("An error ocurred", e.message);
  });

  const authenticated = jwtMiddleware(authorization);
  apiRouter.get("/museums", authenticated, async (ctx) => {
    ctx.response.body = {
      museums: await museum.getAll(),
    };
  });
  apiRouter.post("/users/register", async (ctx) => {
    const { username, password } = await ctx.request.body({ type: "json" })
      .value;
    if (!username || !password) {
      ctx.response.status = 400;
      return;
    }

    try {
      const createdUser = await user.register({ username, password });
      ctx.response.status = 201;
      ctx.response.body = { user: createdUser };
    } catch (e: any) {
      ctx.response.status = 400;
      ctx.response.body = { message: e.message };
    }
  });
  apiRouter.post("/login", async (ctx) => {
    const { username, password } = await ctx.request.body().value;
    try {
      const { user: loginUser, token } = await user.login({
        username,
        password,
      });
      ctx.response.body = { user: loginUser, token };
      ctx.response.status = 201;
    } catch (e: any) {
      ctx.response.body = { message: e.message };
      ctx.response.status = 400;
    }
  });

  app.use(apiRouter.routes());
  app.use(apiRouter.allowedMethods());
  app.use((ctx) => {
    console.log("body: ", ctx.response.body);
  });

  await app.listen({
    port,
    secure,
    certFile,
    keyFile,
  });
}

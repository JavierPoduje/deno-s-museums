import { t } from "./deps.ts";
import { CreateServerDependencies } from "./web/index.ts";
import {
  Controller as MuseumController,
  Repository as MuseumRepository,
} from "./museums/index.ts";
import {
  Controller as UserController,
  Repository as UserRepository,
} from "./users/index.ts";

function createTestServer(options?: CreateServerDependencies) {
  const museumRepository = new MuseumRepository();
  const museumController = new MuseumController({ museumRepository });
  const authConfiguration = {
    algorithm: "HS256" as Algorithm,
    key: "abcd",
    tokenExpirationInSeconds: 120,
  };
  const userRepository = new UserRepository();
  const userController = new UserController({
    userRepository,
    authRepository: new AuthRepository({ configuration: authConfiguration }),
  });
  return createServer({
    configuration: {
      allowerOrigins: [],
      authorization: {
        algorithm: "HS256",
        key: "abcd",
      },
      certFile: "abcd",
      keyFile: "abcd",
      port: 9001,
      secure: false,
    },
    museum: museumController,
    user: userController,
    ...options,
  });
}

Deno.test("it returns user and token when user logs in", async () => {
  const jsonHeaders = new Headers();
  jsonHeaders.set("content-type", "application/json");
  const server = await createTestServer();

  // Registering a user
  await register("test-user", "test-password");
  const response = await login("test-user", "test-password");

  t.assertEquals(response.user.username, "asantos00", "returns username");
  t.assert(!!response.user.createdAt, "has createdAt date");
  t.assert(!!response.token, "has createdAt token");

  server.controller.abort();
});

Deno.test("it should let users with a valid token access the museums list", async () => {
  const jsonHeaders = new Headers();
  jsonHeaders.set("content-type", "application/json");
  const server = await createTestServer();
  await register("test-user", "test-password");
  const { token } = await login("test-user", "test-password");

  const authenticateHeaders = new Headers();
  authenticateHeaders.set("content-type", "application/json");
  authenticateHeaders.set("authorization", `Bearer ${token}`);
  const { museums } = await fetch("http://localhost:9001/api/museums", {
    headers: authenticateHeaders,
  }).then((r) => {
    t.assertEquals(r.status, 200);
    return r;
  }).then((r) => r.json());

  t.assertEquals(museums.length, 0);
  server.controller.abort();
});

Deno.test("it should respond with a 401 to a user with an invalid token", async () => {
  const server = await createTestServer();
  const authenticateHeaders = new Headers();
  authenticateHeaders.set("content-type", "application/json");
  authenticateHeaders.set("authorization", `Bearer invalid-token`);
  const response = await fetch("http://localhost:9001/api/museums", {
    headers: authenticateHeaders,
    body: JSON.stringify({ username: "test-user", password: "test-password" }),
  });
  t.assertEquals(response.status, 401);
  t.assertEquals(await response.text(), "Authentication failed");
  server.controller.abort();
});

function register(username: string, password: string) {
  const jsonHeaders = new Headers();
  jsonHeaders.set("content-type", "application/json");
  return fetch(
    "http://localhost:9001/api/users/register",
    {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ username, password }),
    },
  ).then((r) => r.json());
}

function login(username: string, password: string) {
  const jsonHeaders = new Headers();
  jsonHeaders.set("content-type", "application/json");
  return fetch("http://localhost:9001/api/login", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ username, password }),
  }).then((r) => r.json());
}

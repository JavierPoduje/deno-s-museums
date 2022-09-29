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
  const { user: registeredUser } = await fetch(
    "http://localhost:9001/api/users/register",
    {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ username: "asantos00", password: "abcd" }),
    },
  ).then((r) => r.json());

  const response = await fetch("http://localhost:9001/api/login", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({
      username: registeredUser.username,
      password: "abcd",
    }),
  }).then((r) => r.json());

  t.assertEquals(response.user.username, "asantos00", "returns username");
  t.assert(!!response.user.createdAt, "has createdAt date");
  t.assert(!!response.token, "has createdAt token");

  server.controller.abort();
});

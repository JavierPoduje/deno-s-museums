import { Algorithm, AuthRepository, MongoClient } from "./deps.ts";
import {
  Controller as MuseumController,
  Repository as MuseumRepository,
} from "./museums/index.ts";
import {
  Controller as UserController,
  Repository as UserRepository,
} from "./users/index.ts";
import { createServer } from "./web/index.ts";

const client = new MongoClient();
client.connectWithUri(
  "mongodb+src://<username>:<password>@clustername.mongodb.net/test?retryWrites=true&w=majority&useNewUrlParser=true&useUnifiedTopology=true",
);
const db = client.database("getting-started-with-deno");

const authConfiguration = {
  algorithm: "HS512" as Algorithm,
  key: "my-insecure-key",
  tokenExpirationInSeconds: 120,
};
const authRepository = new AuthRepository({
  configuration: authConfiguration,
});
const museumRepository = new MuseumRepository();
const museumController = new MuseumController({ museumRepository });
const userRepository = new UserRepository({ storage: db });
const userController = new UserController({ userRepository, authRepository });

museumRepository.storage.set("hola", {
  id: "hola",
  name: "the louvre",
  description: "The world's...",
  location: { lat: "48.80", lng: "2.33" },
});

createServer({
  configuration: {
    port: 8080,
    authorization: {
      key: authConfiguration.key,
      algorithm: authConfiguration.algorithm,
    },
    allowedOrigins: ["http://localhost:3000"],
  },
  museum: museumController,
  user: userController,
});

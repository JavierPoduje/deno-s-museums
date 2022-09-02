import { Algorithm, AuthRepository, MongoClient } from "./deps.ts";
import { load as loadConfiguration } from './config/index.ts';
import {
  Controller as MuseumController,
  Repository as MuseumRepository,
} from "./museums/index.ts";
import {
  Controller as UserController,
  Repository as UserRepository,
} from "./users/index.ts";
import { createServer } from "./web/index.ts";

const config = await loadConfiguration();
const client = new MongoClient();
client.connectWithUri(
  `mongodb+src://deno-api:password@${config.mongoDb.clusterURI}`,
);
const db = client.database("getting-started-with-deno");

const authConfiguration = {
  algorithm: config.jwt.algorith as Algorithm,
  key: "my-insecure-key",
  tokenExpirationInSeconds: config.jwt.expirationTime,
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
    port: config.web.port,
    authorization: {
      key: authConfiguration.key,
      algorithm: authConfiguration.algorithm,
    },
    allowedOrigins: config.cors.allowedOrigins,
  },
  museum: museumController,
  user: userController,
  secure: true,
  certFile: config.https.certificate,
  keyFile: config.https.key,
});

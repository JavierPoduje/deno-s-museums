import {
  Controller as MuseumController,
  Repository as MuseumRepository,
} from "./museums/index.ts";
import {
  Controller as UserController,
  Repository as UserRepository,
} from "./users/index.ts";
import { createServer } from "./web/index.ts";

const museumRepository = new MuseumRepository();
const museumController = new MuseumController({ museumRepository });
const userRepository = new UserRepository();
const userController = new UserController({ userRepository });

museumRepository.storage.set("hola", {
  id: "hola",
  name: "the louvre",
  description: "The world's...",
  location: { lat: "48.80", lng: "2.33" },
});

createServer({
  configuration: { port: 8080 },
  museum: museumController,
  user: userController,
});

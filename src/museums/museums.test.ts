import { t } from "../deps.ts";
import { Controller, Repository } from "./index.ts";

Deno.test("it is able to get all the museums from storage", async () => {
  const respository = new Repository();

  respository.storage.set("0", {
    description: "museum with id 0",
    name: "my-museum",
    id: "0",
    location: { lat: "123", lng: "321" },
  });

  respository.storage.set("1", {
    description: "museum with id 1",
    name: "my-museum",
    id: "1",
    location: { lat: "123", lng: "321" },
  });

  const controller = new Controller({ museumRepository: respository });

  const allMuseums = await controller.getAll();
  t.assertEquals(allMuseums.length, 2);
  t.assertEquals(allMuseums[0].name, "my-museum", "has name");
  t.assertEquals(allMuseums[0].description, "museum with id 0", "has description");
  t.assertEquals(allMuseums[0].id, "0", "has id");
  t.assertEquals(allMuseums[0].location.lat, "123", "has latitute");
  t.assertEquals(allMuseums[0].location.lng, "321", "has longitude");
});

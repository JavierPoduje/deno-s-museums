import { benchmark } from "../deps.ts";
import { generateSalt, hashWithSalt } from "./util.ts";

benchmark.bench({
  name: "runsSaltFunction1000Times",
  runs: 1000,
  func: (b: any) => {
    b.start();
    generateSalt();
    b.stop();
  },
});

benchmark.runBenchmarks();

benchmark.bench({
  name: "runsHashFunction1000Times",
  runs: 1000,
  func: (b: any) => {
    b.start();
    hashWithSalt("password", "salt");
    b.stop();
  },
});

benchmark.runBenchmarks();

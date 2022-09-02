import type { Algorithm, parse } from "../deps.ts";

type Configuration = {
  web: {
    port: number;
  };
  cors: {
    allowedOrigins: string[];
  };
  https: {
    key: string;
    certificate: string;
  };
  jwt: {
    algorith: Algorithm;
    expirationTime: number;
  };
  mongoDb: {
    clusterURI: string;
    database: string;
  };
};

export async function load(env = "dev"): Promise<Configuration> {
  const configuration = parse(
    await Deno.readTextFile(`./config.${env}.yaml`),
  ) as Configuration;
}

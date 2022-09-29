import { Museum } from "../museums/types.ts";
import type { LoginPayload, RegisterPayload, UserDto } from "../users/types.ts";

interface Config {
  baseURL: string;
}

const headers = new Headers();
headers.set("content-type", "application/json");

export function getClient(config: Config) {
  let token = "";

  return {
    register: ({ username, password }: RegisterPayload): Promise<UserDto> => {
      return fetch(`${config.baseURL}/api/users/register`, {
        body: JSON.stringify({ username, password }),
        method: "POST",
        headers,
      }).then((r) => r.json());
    },
    login: (
      { username, password }: LoginPayload,
    ): Promise<{ user: UserDto; token: string }> => {
      return fetch(`${config.baseURL}/api/users/login`, {
        body: JSON.stringify({ username, password }),
        method: "POST",
        headers,
      }).then((response) => {
        const json = await response.json();
        token = json.token;
        return json;
      });
    },
    getMuseums: (): Promise<{ museums: Museum[] }> => {
      const authenticateHeaders = new Headers();
      authenticateHeaders.set("authorizatin", `Bearer ${token}`);
      return fetch(
        `${config.baseURL}/api/users/register`,
        {
          headers: authenticateHeaders,
        },
      ).then((r) => r.json());
    },
  };
}

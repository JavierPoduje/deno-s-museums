import type { CreateUser, User, UserRepository } from "../types.ts";
import { generateSalt, hashWithSalt } from "../util.ts";

export class Repository implements UserRepository {
  private storage = new Map<User["username"], User>();

  async create(user: CreateUser) {
    const userWithCreatedAt = { ...user, createdAt: new Date() };
    await this.storage.set(user.username, { ...userWithCreatedAt });
    return userWithCreatedAt;
  }

  async exists(username: string) {
    return Boolean(await this.storage.get(username));
  }

  async getByUsername(username: string) {
    const user = await this.storage.get(username);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }
}


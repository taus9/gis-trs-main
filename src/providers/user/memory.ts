import type { User, UserStore } from "../../interfaces/user.ts";

export class MemoryUserStore implements UserStore {
  private store = new Map<string, User>();
  async get(id: string): Promise<User | null> {
    return this.store.get(id) ?? null;
  }
  async upsert(record: User): Promise<void> {
    this.store.set(record.id, record);
  }
  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }
}

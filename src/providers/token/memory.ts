import type { StoredToken, TokenStore } from "../../interfaces/token.ts";

export class MemoryTokenStore implements TokenStore {
  private store = new Map<string, StoredToken>();
  async get(user_id: string): Promise<StoredToken | null> {
    return this.store.get(user_id) ?? null;
  }
  async upsert(token: StoredToken): Promise<void> {
    this.store.set(token.user_id, token);
  }
  async delete(user_id: string): Promise<boolean> {
    return this.store.delete(user_id);
  }
}

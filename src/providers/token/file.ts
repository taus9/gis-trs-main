import { ensureDir } from "std/fs/ensure_dir.ts";
import { join } from "std/path/mod.ts";
import type { StoredToken, TokenStore } from "../../interfaces/token.ts";

interface FileShape {
  tokens: Record<string, StoredToken>;
}

export class FileTokenStore implements TokenStore {
  private dir: string;
  private file: string;
  constructor(baseDir = ".data", fileName = "tokens.json") {
    this.dir = baseDir;
    this.file = join(baseDir, fileName);
  }

  private async load(): Promise<FileShape> {
    try {
      const text = await Deno.readTextFile(this.file);
      return JSON.parse(text);
    } catch (_) {
      return { tokens: {} };
    }
  }

  private async save(data: FileShape): Promise<void> {
    await ensureDir(this.dir);
    const text = JSON.stringify(data, null, 2);
    await Deno.writeTextFile(this.file, text);
  }

  async get(user_id: string): Promise<StoredToken | null> {
    const data = await this.load();
    return data.tokens[user_id] ?? null;
  }

  async upsert(token: StoredToken): Promise<void> {
    const data = await this.load();
    data.tokens[token.user_id] = token;
    await this.save(data);
  }

  async delete(user_id: string): Promise<boolean> {
    const data = await this.load();
    const existed = user_id in data.tokens;
    if (existed) {
      delete data.tokens[user_id];
      await this.save(data);
      return true;
    }
    return false;
  }
}

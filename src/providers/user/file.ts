import { ensureDir } from "std/fs/ensure_dir.ts";
import { join } from "std/path/mod.ts";
import type { User, UserStore } from "../../interfaces/user.ts";

interface FileShape {
  users: Record<string, User>;
}

export class FileUserStore implements UserStore {
  private dir: string;
  private file: string;
  constructor(baseDir = ".data", fileName = "users.json") {
    this.dir = baseDir;
    this.file = join(baseDir, fileName);
  }

  private async load(): Promise<FileShape> {
    try {
      const text = await Deno.readTextFile(this.file);
      return JSON.parse(text);
    } catch (_) {
      return { users: {} };
    }
  }

  private async save(data: FileShape): Promise<void> {
    await ensureDir(this.dir);
    const text = JSON.stringify(data, null, 2);
    await Deno.writeTextFile(this.file, text);
  }

  async get(id: string): Promise<User | null> {
    const data = await this.load();
    return data.users[id] ?? null;
  }

  async upsert(record: User): Promise<void> {
    const data = await this.load();
    data.users[record.id] = record;
    await this.save(data);
  }

  async delete(id: string): Promise<boolean> {
    const data = await this.load();
    const existed = id in data.users;
    if (existed) {
      delete data.users[id];
      await this.save(data);
      return true;
    }
    return false;
  }
}

export interface User {
    id: string;
    api_key: string;
    created_at: number;
}

export interface UserStore {
    get(id: string): Promise<User | null>;
    upsert(record: User): Promise<void>;
    delete(id: string): Promise<boolean>;
}
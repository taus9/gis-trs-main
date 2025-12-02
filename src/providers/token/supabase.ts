import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import type { StoredToken, TokenStore } from "../../interfaces/token.ts";

export class SupabaseTokenStore implements TokenStore {

    private supabase: SupabaseClient;
    private readonly table = 'tokens';

    constructor(supabase: SupabaseClient) {
        this.supabase = supabase;
    }

    async get(user_id: string): Promise<StoredToken | null> {
        const {data, error} = await this.supabase
            .from(this.table)
            .select("*")
            .eq('user_id', user_id)
            .single();

        if (!data) return null;

        if (error) {
            console.error('Supabase error fetching token:', error);
            throw error;
        }
        return data;
    }

    async upsert(token: StoredToken): Promise<void> {
        const {error} = await this.supabase
            .from(this.table)
            .upsert(token, {onConflict: 'user_id'})
            .select();

        if (error) {
            console.error('Supabase error upserting token:', error);
            throw error;
        }
    }

    async delete(user_id: string): Promise<boolean> {
        const response = await this.supabase
            .from(this.table)
            .delete()
            .eq('user_id', user_id);

        if (response.status === 204) {
            return true;
        } else {
            return false;
        }
    }
}
import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import type { User, UserStore } from '../../interfaces/user.ts';

export class SupabaseUserStore implements UserStore {

    private supabase: SupabaseClient;
    private readonly table = 'users';

    constructor(supabase: SupabaseClient) {
        this.supabase = supabase;
    }

    async get(id: string): Promise<User | null> {
        const {data, error} = await this.supabase
            .from(this.table)
            .select("*")
            .eq('id', id)
            .single();

        if (!data) return null;

        if (error) {
            console.error('Supabase error fetching user:', error);
            throw error;
        }
        return data;
    }

    async upsert(user: User): Promise<void> {
        const {error} = await this.supabase
            .from(this.table)
            .upsert(user, {onConflict: 'id'})
            .select();

        if (error) {
            console.error('Supabase error upserting user:', error);
            throw error;
        }
    }

    async delete(id: string): Promise<boolean> {
        const response = await this.supabase
            .from(this.table)
            .delete()
            .eq('id', id);

        if (response.status === 204) {
            return true;
        } else {
            return false;
        }
    }
}
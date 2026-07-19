import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import { Env } from './env';

export function getSupabase(env: Env, authToken?: string): SupabaseClient<Database> {
	const options = authToken
		? {
				global: {
					headers: {
						Authorization: `Bearer ${authToken}`,
					},
				},
		  }
		: {};

	return createClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, options);
}

export function getSupabaseAdmin(env: Env): SupabaseClient<Database> {
    return createClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
}

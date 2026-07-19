export interface Env {
	SUPABASE_URL: string;
	SUPABASE_ANON_KEY: string;
	AI: any; // Binding to Cloudflare Workers AI
	VECTORIZE: any; // Binding to Cloudflare Vectorize
}

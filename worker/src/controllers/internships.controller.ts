import { Env } from '../config/env';
import { AuthContext } from '../middleware/auth';
import { createResponse, createErrorResponse } from '../utils/response';
import { getSupabase, getSupabaseAdmin } from '../config/supabase';

export async function getInternships(request: Request, env: Env): Promise<Response> {
    try {
        const url = new URL(request.url);
        const limit = parseInt(url.searchParams.get('limit') || '50');
        const offset = parseInt(url.searchParams.get('offset') || '0');

        const supabase = getSupabaseAdmin(env);

        const { data, error, count } = await supabase
            .from('internships')
            .select(`
                *,
                companies (
                    company_name,
                    description
                )
            `, { count: 'exact' })
            .range(offset, offset + limit - 1)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        return createResponse({
            items: data,
            total: count,
            limit,
            offset
        });
    } catch (error: any) {
        return createErrorResponse('Failed to fetch internships', error.message, 500);
    }
}

export async function createInternship(request: Request, env: Env, auth: AuthContext): Promise<Response> {
    try {
        const body: any = await request.json();
        const supabase = getSupabase(env, auth.token);

        // Verify user is a company
        const { data: user } = await supabase
            .from('users')
            .select('role')
            .eq('id', auth.user.id)
            .single();

        if (user?.role !== 'company') {
            return createErrorResponse('Unauthorized: Only companies can post internships', null, 403);
        }

        // Get company ID
        const { data: company, error: companyError } = await supabase
            .from('companies')
            .select('id')
            .eq('user_id', auth.user.id)
            .single();

        if (companyError || !company) {
            return createErrorResponse('Company profile not found', companyError, 404);
        }

        let vector_id = null;

        // Create embedding for Vectorize semantic search if AI is available
        if (env.AI && env.VECTORIZE) {
            try {
                const internshipText = [
                    body.title,
                    body.description,
                    ...(body.required_skills || [])
                ].filter(Boolean).join(' ');

                const aiResponse = await env.AI.run('@cf/baai/bge-small-en-v1.5', {
                    text: internshipText
                });

                const embedding = aiResponse.data[0];

                // create a vector ID, usually just use standard UUID or let database handle it and update, but
                // we can just generate a UUID here or use the internship title as part of it
                vector_id = crypto.randomUUID();

                await env.VECTORIZE.insert([
                    {
                        id: vector_id,
                        values: embedding,
                        metadata: {
                            company_id: company.id,
                            title: body.title
                        }
                    }
                ]);
            } catch (err) {
                console.error("Failed to vectorize new internship:", err);
            }
        }

        const { data, error } = await supabase
            .from('internships')
            .insert({
                company_id: company.id,
                title: body.title,
                description: body.description,
                required_skills: body.required_skills,
                location: body.location,
                duration: body.duration,
                stipend: body.stipend,
                work_mode: body.work_mode,
                vector_id: vector_id
            })
            .select()
            .single();

        if (error) throw error;

        return createResponse(data, 'Internship created successfully', 201);
    } catch (error: any) {
        return createErrorResponse('Failed to create internship', error.message, 500);
    }
}

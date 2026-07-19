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
            })
            .select()
            .single();

        if (error) throw error;

        return createResponse(data, 'Internship created successfully', 201);
    } catch (error: any) {
        return createErrorResponse('Failed to create internship', error.message, 500);
    }
}

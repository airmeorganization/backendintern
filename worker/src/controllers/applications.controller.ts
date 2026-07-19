import { Env } from '../config/env';
import { AuthContext } from '../middleware/auth';
import { createResponse, createErrorResponse } from '../utils/response';
import { getSupabase } from '../config/supabase';

export async function getApplications(request: Request, env: Env, auth: AuthContext): Promise<Response> {
    try {
        const supabase = getSupabase(env, auth.token);

        // Get user role
        const { data: user } = await supabase
            .from('users')
            .select('role')
            .eq('id', auth.user.id)
            .single();

        if (user?.role === 'student') {
            const { data, error } = await supabase
                .from('applications')
                .select(`
                    *,
                    internships (
                        title,
                        company_id,
                        companies (
                            company_name
                        )
                    )
                `)
                .eq('student_id', auth.user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return createResponse(data);
        } else if (user?.role === 'company') {
            // Get company ID
            const { data: company } = await supabase
                .from('companies')
                .select('id')
                .eq('user_id', auth.user.id)
                .single();

            if (!company) {
                return createErrorResponse('Company profile not found', null, 404);
            }

            const { data, error } = await supabase
                .from('applications')
                .select(`
                    *,
                    users (
                        full_name,
                        email
                    ),
                    student_profiles (
                        education,
                        skills,
                        resume_url
                    ),
                    internships!inner (
                        title,
                        company_id
                    )
                `)
                .eq('internships.company_id', company.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return createResponse(data);
        }

        return createErrorResponse('Invalid user role', null, 400);
    } catch (error: any) {
        return createErrorResponse('Failed to fetch applications', error.message, 500);
    }
}

export async function createApplication(request: Request, env: Env, auth: AuthContext): Promise<Response> {
    try {
        const body: any = await request.json();
        const supabase = getSupabase(env, auth.token);

        // Verify user is a student
        const { data: user } = await supabase
            .from('users')
            .select('role')
            .eq('id', auth.user.id)
            .single();

        if (user?.role !== 'student') {
            return createErrorResponse('Unauthorized: Only students can apply', null, 403);
        }

        // Check if already applied
        const { data: existingApp } = await supabase
            .from('applications')
            .select('id')
            .eq('student_id', auth.user.id)
            .eq('internship_id', body.internship_id)
            .single();

        if (existingApp) {
            return createErrorResponse('Already applied to this internship', null, 400);
        }

        const { data, error } = await supabase
            .from('applications')
            .insert({
                student_id: auth.user.id,
                internship_id: body.internship_id,
                status: 'Applied'
            })
            .select()
            .single();

        if (error) throw error;

        return createResponse(data, 'Application submitted successfully', 201);
    } catch (error: any) {
        return createErrorResponse('Failed to submit application', error.message, 500);
    }
}

import { Env } from '../config/env';
import { AuthContext } from '../middleware/auth';
import { createResponse, createErrorResponse } from '../utils/response';
import { getSupabase } from '../config/supabase';

export async function getProfile(request: Request, env: Env, auth: AuthContext): Promise<Response> {
    try {
        const supabase = getSupabase(env, auth.token);

        // Fetch user basic data
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', auth.user.id)
            .single();

        if (userError) {
            return createErrorResponse('User not found', userError, 404);
        }

        // Fetch additional profile based on role
        if (user.role === 'student') {
            const { data: profile, error: profileError } = await supabase
                .from('student_profiles')
                .select('*')
                .eq('user_id', auth.user.id)
                .single();

            return createResponse({ ...user, profile: profile || null });
        } else if (user.role === 'company') {
            const { data: company, error: companyError } = await supabase
                .from('companies')
                .select('*')
                .eq('user_id', auth.user.id)
                .single();

            return createResponse({ ...user, company: company || null });
        }

        return createResponse(user);
    } catch (error: any) {
        return createErrorResponse('Failed to fetch profile', error.message, 500);
    }
}

export async function updateProfile(request: Request, env: Env, auth: AuthContext): Promise<Response> {
    try {
        const body: any = await request.json();
        const supabase = getSupabase(env, auth.token);

        const { data: user, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', auth.user.id)
            .single();

        if (userError || !user) {
            return createErrorResponse('User not found', userError, 404);
        }

        if (user.role === 'student') {
            const { data, error } = await supabase
                .from('student_profiles')
                .upsert({
                    user_id: auth.user.id,
                    ...body,
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;
            return createResponse(data, 'Profile updated successfully');
        } else if (user.role === 'company') {
             const { data, error } = await supabase
                .from('companies')
                .upsert({
                    user_id: auth.user.id,
                    ...body,
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;
            return createResponse(data, 'Company profile updated successfully');
        }

        return createErrorResponse('Invalid user role', null, 400);
    } catch (error: any) {
        return createErrorResponse('Failed to update profile', error.message, 500);
    }
}

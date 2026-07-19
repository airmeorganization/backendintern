import { Env } from '../config/env';
import { getSupabase } from '../config/supabase';
import { createErrorResponse } from '../utils/response';

export interface AuthContext {
    user: any;
    token: string;
}

export async function withAuth(
    request: Request,
    env: Env,
    handler: (request: Request, env: Env, auth: AuthContext) => Promise<Response>
): Promise<Response> {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return createErrorResponse('Unauthorized: Missing or invalid token', null, 401);
    }

    const token = authHeader.split(' ')[1];

    try {
        const supabase = getSupabase(env, token);
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return createErrorResponse('Unauthorized: Invalid token', error, 401);
        }

        return handler(request, env, { user, token });
    } catch (e) {
        return createErrorResponse('Internal Server Error during authentication', null, 500);
    }
}

import { Env } from '../config/env';
import { getSupabase } from '../config/supabase';
import { createErrorResponse } from '../utils/response';

export interface AuthContext {
    user: {
        id: string;
        email?: string;
    };
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

    const token = authHeader.replace('Bearer ', '');
    const supabase = getSupabase(env);

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return createErrorResponse('Unauthorized: Invalid token', error?.message, 401);
        }

        const authContext: AuthContext = {
            user: {
                id: user.id,
                email: user.email,
            },
            token,
        };

        return await handler(request, env, authContext);
    } catch (error: any) {
        return createErrorResponse('Internal Server Error', error.message, 500);
    }
}

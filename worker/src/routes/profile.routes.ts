import { Env } from '../config/env';
import { withAuth, AuthContext } from '../middleware/auth';
import { getProfile, updateProfile } from '../controllers/profile.controller';
import { createErrorResponse } from '../utils/response';

export async function handleProfileRoutes(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;

    // Use regular expressions to match trailing slashes, or just replace trailing slash
    const pathname = url.pathname.replace(/\/$/, '');

    if (pathname === '/api/v1/profile') {
        if (method === 'GET') {
            return withAuth(request, env, async (req, env, auth) => {
                return getProfile(req, env, auth);
            });
        }

        if (method === 'POST') {
            return withAuth(request, env, async (req, env, auth) => {
                return updateProfile(req, env, auth);
            });
        }

        return createErrorResponse('Method Not Allowed', null, 405);
    }

    return createErrorResponse('Not Found', null, 404);
}

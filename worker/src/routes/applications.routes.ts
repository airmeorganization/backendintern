import { Env } from '../config/env';
import { withAuth } from '../middleware/auth';
import { getApplications, createApplication } from '../controllers/applications.controller';
import { createErrorResponse } from '../utils/response';

export async function handleApplicationRoutes(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;

    const pathname = url.pathname.replace(/\/$/, '');

    if (pathname === '/api/v1/applications') {
        if (method === 'GET') {
            return withAuth(request, env, async (req, env, auth) => {
                return getApplications(req, env, auth);
            });
        }

        if (method === 'POST') {
            return withAuth(request, env, async (req, env, auth) => {
                return createApplication(req, env, auth);
            });
        }

        return createErrorResponse('Method Not Allowed', null, 405);
    }

    return createErrorResponse('Not Found', null, 404);
}

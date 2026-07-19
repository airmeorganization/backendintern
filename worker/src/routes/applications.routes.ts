import { Env } from '../config/env';
import { withAuth } from '../middleware/auth';
import { getApplications, createApplication } from '../controllers/applications.controller';
import { createErrorResponse } from '../utils/response';

export async function handleApplicationRoutes(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;

    if (method === 'GET' && url.pathname === '/api/v1/applications') {
        return withAuth(request, env, async (req, env, auth) => {
            return getApplications(req, env, auth);
        });
    }

    if (method === 'POST' && url.pathname === '/api/v1/applications') {
        return withAuth(request, env, async (req, env, auth) => {
            return createApplication(req, env, auth);
        });
    }

    return createErrorResponse('Method Not Allowed', null, 405);
}

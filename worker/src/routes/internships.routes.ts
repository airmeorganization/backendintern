import { Env } from '../config/env';
import { withAuth } from '../middleware/auth';
import { getInternships, createInternship } from '../controllers/internships.controller';
import { createErrorResponse } from '../utils/response';

export async function handleInternshipRoutes(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;

    const pathname = url.pathname.replace(/\/$/, '');

    if (pathname === '/api/v1/internships') {
        if (method === 'GET') {
            return getInternships(request, env);
        }

        if (method === 'POST') {
            return withAuth(request, env, async (req, env, auth) => {
                return createInternship(req, env, auth);
            });
        }

        return createErrorResponse('Method Not Allowed', null, 405);
    }

    return createErrorResponse('Not Found', null, 404);
}

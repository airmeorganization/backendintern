import { Env } from '../config/env';
import { withAuth } from '../middleware/auth';
import { getRecommendations } from '../controllers/recommendations.controller';
import { createErrorResponse } from '../utils/response';

export async function handleRecommendationRoutes(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;

    const pathname = url.pathname.replace(/\/$/, '');

    if (pathname === '/api/v1/recommendations') {
        if (method === 'GET') {
            return withAuth(request, env, async (req, env, auth) => {
                return getRecommendations(req, env, auth);
            });
        }

        return createErrorResponse('Method Not Allowed', null, 405);
    }

    return createErrorResponse('Not Found', null, 404);
}

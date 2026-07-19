import { Env } from '../config/env';
import { handleProfileRoutes } from './profile.routes';
import { handleInternshipRoutes } from './internships.routes';
import { handleApplicationRoutes } from './applications.routes';

export function setupRouter() {
    return async (request: Request, env: Env, ctx: ExecutionContext): Promise<Response | null> => {
        const url = new URL(request.url);
        let path = url.pathname;
        if (path.endsWith('/') && path.length > 1) {
            path = path.slice(0, -1);
        }

        if (path.startsWith('/api/v1/profile')) {
            return handleProfileRoutes(request, env);
        }

        if (path.startsWith('/api/v1/internships')) {
            return handleInternshipRoutes(request, env);
        }

        if (path.startsWith('/api/v1/applications')) {
            return handleApplicationRoutes(request, env);
        }

        return null;
    };
}

import { Env } from './config/env';
import { createResponse, createErrorResponse } from './utils/response';
import { setupRouter } from './routes/router';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		// CORS Handling
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type, Authorization',
				},
			});
		}

		try {
			const router = setupRouter();
			let response = await router(request, env, ctx);

            // Add CORS headers to all responses
            if (response) {
                const newHeaders = new Headers(response.headers);
                newHeaders.set('Access-Control-Allow-Origin', '*');
                response = new Response(response.body, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: newHeaders
                });
                return response;
            }

			return createErrorResponse('Not Found', null, 404);
		} catch (error: any) {
			console.error(`[Error] ${request.method} ${url.pathname}:`, error);
			return createErrorResponse('Internal Server Error', error.message, 500);
		}
	},
};

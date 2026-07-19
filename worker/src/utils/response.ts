export interface ApiResponse<T = any> {
	success: boolean;
	data?: T;
	message?: string;
	errors?: any;
}

export function createResponse<T>(data: T, message: string = "", status: number = 200): Response {
	const responseBody: ApiResponse<T> = {
		success: true,
		data,
		message,
		errors: null
	};
	return new Response(JSON.stringify(responseBody), {
		status,
		headers: {
			"Content-Type": "application/json",
		},
	});
}

export function createErrorResponse(message: string, errors: any = null, status: number = 400): Response {
	const responseBody: ApiResponse<null> = {
		success: false,
		message,
		errors
	};
	return new Response(JSON.stringify(responseBody), {
		status,
		headers: {
			"Content-Type": "application/json",
		},
	});
}

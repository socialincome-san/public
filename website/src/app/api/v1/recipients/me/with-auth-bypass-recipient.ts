import { AuthBypassService } from '@/lib/services/auth-bypass/auth-bypass.service';
import { logger } from '@/lib/utils/logger';
import { NextRequest, NextResponse } from 'next/server';

export function withAuthBypassRecipient(handler: (req: NextRequest) => Promise<Response>) {
	const bypass = new AuthBypassService();

	return async (request: NextRequest): Promise<Response> => {
		if (bypass.matchesAuthorizationHeader(request)) {
			logger.info('[AUTH_BYPASS] test recipient requested', {
				path: request.url,
				method: request.method,
			});

			const result = bypass.createTestRecipient();

			if (result.success) {
				return NextResponse.json(result.data, { status: 200 });
			}

			logger.warn('[AUTH_BYPASS] failed to create test recipient', {
				error: result.error,
				status: result.status,
			});

			return new Response(result.error, { status: result.status ?? 500 });
		}

		return handler(request);
	};
}

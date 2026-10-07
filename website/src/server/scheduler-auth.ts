import { sendSlackAlert } from '@/lib/utils/slack-alert';
import { type NextRequest, NextResponse } from 'next/server';

type Handler = (request: NextRequest) => Response | Promise<Response>;

const unauthorized = () => NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

/**
 * Accepts Vercel Cron and manual calls that send `Authorization: Bearer $CRON_SECRET`.
 */
export const withSchedulerAuth = (handler: Handler) => {
	return async (request: NextRequest): Promise<Response> => {
		const cronSecret = process.env.CRON_SECRET;
		if (!cronSecret) {
			sendSlackAlert('CRON_SECRET is not set');

			return unauthorized();
		}

		if (request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
			console.warn('Scheduler request unauthorized');

			return unauthorized();
		}

		return handler(request);
	};
};

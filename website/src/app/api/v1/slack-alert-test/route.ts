import { SLACK_ALERT } from '@/lib/utils/slack-alert';
import { NextRequest, NextResponse } from 'next/server';

export const GET = (request: NextRequest) => {
	if (!process.env.SCHEDULER_API_KEY) {
		console.error(`${SLACK_ALERT}: Scheduler API key not set`);

		return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
	}

	const apiKey = request.nextUrl.searchParams.get('key') ?? request.headers.get('x-api-key');
	if (apiKey !== process.env.SCHEDULER_API_KEY) {
		console.warn('Scheduler API key wrong');

		return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
	}

	console.error(`${SLACK_ALERT}: Test alert from GET /api/v1/slack-alert-test`);

	return NextResponse.json({ ok: true, alerted: true });
};

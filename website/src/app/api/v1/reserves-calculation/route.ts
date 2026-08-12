import { logger } from '@/lib/utils/logger';
import { NextRequest, NextResponse } from 'next/server';

export const POST = (request: NextRequest) => {
	const apiKey = request.headers.get('x-api-key');

	if (apiKey !== process.env.SCHEDULER_API_KEY || !process.env.SCHEDULER_API_KEY) {
		logger.alert('Scheduler API key not set or wrong');

		return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
	}

	// TODO: Call external APIs, collect reserve values, and write them to the database.
	logger.info('Reserves calculation endpoint called');

	return NextResponse.json({}, { status: 201 });
};

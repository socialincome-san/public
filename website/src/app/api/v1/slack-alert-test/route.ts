import { sendSlackAlert } from '@/lib/utils/slack-alert';
import { withSchedulerAuth } from '@/server/scheduler-auth';
import { NextResponse } from 'next/server';

export const GET = withSchedulerAuth(() => {
	sendSlackAlert('Test alert from GET /api/v1/slack-alert-test');

	return NextResponse.json({ ok: true, alerted: true });
});

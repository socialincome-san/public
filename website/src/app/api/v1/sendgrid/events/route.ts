import { sendSlackAlert } from '@/lib/utils/slack-alert';
import { handleSendgridEvents } from '@/modules/mail/mail.service';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
	const signature = request.headers.get('x-twilio-email-event-webhook-signature');
	const timestamp = request.headers.get('x-twilio-email-event-webhook-timestamp');
	if (!signature || !timestamp) {
		return NextResponse.json({ error: 'forbidden' }, { status: 403 });
	}

	// The signature covers the exact bytes SendGrid sent, so the body must not be re-serialized.
	const result = await handleSendgridEvents({ signature, timestamp, rawBody: await request.text() });
	if (!result.success) {
		if (result.status === 403 || result.status === 400) {
			console.warn('Rejected SendGrid event webhook', { error: result.error });

			return NextResponse.json({ error: 'bad request' }, { status: result.status });
		}
		sendSlackAlert('SendGrid event webhook failed', { error: result.error });

		return NextResponse.json({ error: 'internal' }, { status: 500 });
	}

	return NextResponse.json({ ok: true });
}

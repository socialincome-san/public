import { after } from 'next/server';

export const SLACK_ALERT = 'SLACK_ALERT';

const SLACK_WEBHOOK_TIMEOUT_MS = 5000;
// Per function instance, so it caps bursts rather than being a global limit.
const SLACK_ALERT_MIN_INTERVAL_MS = 5 * 60 * 1000;

let lastSlackAlertSentAt = 0;
let suppressedSlackAlertCount = 0;

const postSlackAlert = async (webhookUrl: string, text: string) => {
	try {
		const response = await fetch(webhookUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ text }),
			signal: AbortSignal.timeout(SLACK_WEBHOOK_TIMEOUT_MS),
		});
		if (!response.ok) {
			console.error(`Slack alert delivery failed with status ${response.status}`);
		}
	} catch (error) {
		console.error('Slack alert delivery failed', { error });
	}
};

// Only the message goes to Slack; keep personal data and error details in the context, which is only logged.
export const sendSlackAlert = (message: string, context?: Record<string, unknown>) => {
	const logMessage = `${SLACK_ALERT}: ${message}`;
	if (context) {
		console.error(logMessage, context);
	} else {
		console.error(logMessage);
	}

	const webhookUrl = process.env.SLACK_ALERT_WEBHOOK_URL;
	if (!webhookUrl) {
		return;
	}

	const now = Date.now();
	if (now - lastSlackAlertSentAt < SLACK_ALERT_MIN_INTERVAL_MS) {
		suppressedSlackAlertCount += 1;

		return;
	}

	const environment = process.env.VERCEL_TARGET_ENV ?? process.env.NEXT_PUBLIC_APP_ENVIRONMENT ?? 'unknown';
	const suppressedNote =
		suppressedSlackAlertCount > 0 ? ` (+${suppressedSlackAlertCount} more alerts since the last message, see logs)` : '';
	const text = `*[${environment}]* ${message}${suppressedNote}`;
	lastSlackAlertSentAt = now;
	suppressedSlackAlertCount = 0;

	try {
		after(() => postSlackAlert(webhookUrl, text));
	} catch {
		// `after` only works inside a request.
		void postSlackAlert(webhookUrl, text);
	}
};

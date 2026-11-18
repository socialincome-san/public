import { resultFail, resultOk, type Result } from '@/lib/result';
import { createPublicKey, verify } from 'node:crypto';

export type SendgridEventWebhookInput = {
	signature: string;
	timestamp: string;
	rawBody: string;
};

export const verifySendgridEventWebhook = (input: SendgridEventWebhookInput): Result<boolean> => {
	const publicKey = process.env.SENDGRID_EVENT_WEBHOOK_PUBLIC_KEY?.trim();
	if (!publicKey) {
		return resultFail('SendGrid event webhook is not configured');
	}

	try {
		const key = createPublicKey({ key: Buffer.from(publicKey, 'base64'), format: 'der', type: 'spki' });

		return resultOk(
			verify('sha256', Buffer.from(input.timestamp + input.rawBody), key, Buffer.from(input.signature, 'base64')),
		);
	} catch (error) {
		console.error('Could not verify SendGrid event webhook', { error });

		return resultOk(false);
	}
};

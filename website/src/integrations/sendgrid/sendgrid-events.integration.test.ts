import { generateKeyPairSync, sign } from 'node:crypto';
import { verifySendgridEventWebhook } from './sendgrid-events.integration';

const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
const timestamp = '1700000000';
const rawBody = '[{"event":"delivered"}]';
const signature = sign('sha256', Buffer.from(timestamp + rawBody), privateKey).toString('base64');

describe('verifySendgridEventWebhook', () => {
	const originalKey = process.env.SENDGRID_EVENT_WEBHOOK_PUBLIC_KEY;

	beforeEach(() => {
		process.env.SENDGRID_EVENT_WEBHOOK_PUBLIC_KEY = publicKey.export({ format: 'der', type: 'spki' }).toString('base64');
	});

	afterEach(() => {
		process.env.SENDGRID_EVENT_WEBHOOK_PUBLIC_KEY = originalKey;
	});

	test('accepts a payload signed with the configured key', () => {
		expect(verifySendgridEventWebhook({ signature, timestamp, rawBody })).toEqual({ success: true, data: true });
	});

	test('rejects a modified payload', () => {
		expect(verifySendgridEventWebhook({ signature, timestamp, rawBody: '[]' })).toEqual({ success: true, data: false });
	});

	test('fails when the public key is not configured', () => {
		delete process.env.SENDGRID_EVENT_WEBHOOK_PUBLIC_KEY;

		expect(verifySendgridEventWebhook({ signature, timestamp, rawBody })).toEqual({
			success: false,
			error: 'SendGrid event webhook is not configured',
		});
	});
});

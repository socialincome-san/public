import { resultFail, resultOk } from '@/lib/result';
import { createHmac } from 'node:crypto';
import { sendMagicLoginLink } from './magic-link.service';

const mockGenerateFirebaseSignInLink = jest.fn();
const mockDeleteExpiredMagicLinkRateLimits = jest.fn();
const mockIncrementMagicLinkRateLimit = jest.fn();
const mockSendSlackAlert = jest.fn();
const mockSendMail = jest.fn();
const originalMagicLinkTemplateId = process.env.SENDGRID_MAGIC_LOGIN_TEMPLATE_ID;
const originalFirebaseServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

jest.mock('@/integrations/firebase/firebase-auth.integration', () => ({
	generateFirebaseSignInLink: (...args: unknown[]): unknown => mockGenerateFirebaseSignInLink(...args),
}));

jest.mock('@/modules/mail/mail.service', () => ({
	sendMail: (...args: unknown[]): unknown => mockSendMail(...args),
}));

jest.mock('./magic-link-rate-limit.repository', () => ({
	deleteExpiredMagicLinkRateLimits: (...args: unknown[]): unknown => mockDeleteExpiredMagicLinkRateLimits(...args),
	updateMagicLinkRateLimitCount: (...args: unknown[]): unknown => mockIncrementMagicLinkRateLimit(...args),
}));

jest.mock('@/lib/utils/slack-alert', () => ({
	sendSlackAlert: (...args: unknown[]): unknown => mockSendSlackAlert(...args),
}));

beforeEach(() => {
	jest.clearAllMocks();
	mockGenerateFirebaseSignInLink.mockResolvedValue(resultOk('https://example.org/?oobCode=one-time-token'));
	mockDeleteExpiredMagicLinkRateLimits.mockResolvedValue({ count: 0 });
	mockIncrementMagicLinkRateLimit.mockResolvedValue(1);
	mockSendMail.mockResolvedValue(resultOk(undefined));
	process.env.SENDGRID_MAGIC_LOGIN_TEMPLATE_ID = 'd-login-template';
	process.env.FIREBASE_SERVICE_ACCOUNT_JSON = 'test-service-account-secret';
});

afterEach(() => {
	if (originalMagicLinkTemplateId === undefined) {
		delete process.env.SENDGRID_MAGIC_LOGIN_TEMPLATE_ID;
	} else {
		process.env.SENDGRID_MAGIC_LOGIN_TEMPLATE_ID = originalMagicLinkTemplateId;
	}
	if (originalFirebaseServiceAccount === undefined) {
		delete process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
	} else {
		process.env.FIREBASE_SERVICE_ACCOUNT_JSON = originalFirebaseServiceAccount;
	}
	jest.restoreAllMocks();
});

test.each([
	['https://attacker.example/de/chf/auth/confirm-login?email=ada%40example.com', 'https://socialincome.org'],
	['https://socialincome.org/de/chf/auth/confirm-login?email=other%40example.com', 'https://socialincome.org'],
	[
		'https://socialincome.org/de/chf/auth/confirm-login?email=ada%40example.com&campaigns=not-a-claim',
		'https://socialincome.org',
	],
])('rejects unsafe magic-link continue URLs', async (continueUrl, requestOrigin) => {
	await expect(sendMagicLoginLink({ email: 'ada@example.com', continueUrl, requestOrigin })).resolves.toEqual(
		resultFail('Invalid sign-in continue URL'),
	);
	expect(mockIncrementMagicLinkRateLimit).not.toHaveBeenCalled();
	expect(mockGenerateFirebaseSignInLink).not.toHaveBeenCalled();
});

test('sends a localized SendGrid template with a safe archived body and rate-limited identifiers', async () => {
	const continueUrl = 'https://socialincome.org/de/chf/auth/confirm-login?email=ada%40example.com&campaigns=Ab12Cd34';
	const result = await sendMagicLoginLink({
		email: 'ada@example.com',
		continueUrl,
		requestOrigin: 'https://socialincome.org',
		requesterIp: '203.0.113.12',
	});

	expect(result).toEqual(resultOk(undefined));
	expect(mockGenerateFirebaseSignInLink).toHaveBeenCalledWith('ada@example.com', continueUrl);
	expect(mockDeleteExpiredMagicLinkRateLimits).toHaveBeenCalledTimes(1);
	expect(mockIncrementMagicLinkRateLimit).toHaveBeenCalledTimes(2);
	expect(mockIncrementMagicLinkRateLimit).toHaveBeenNthCalledWith(
		1,
		expect.stringMatching(/^[a-f0-9]{64}$/),
		expect.any(Date),
		expect.any(Number),
	);
	expect(mockIncrementMagicLinkRateLimit).toHaveBeenNthCalledWith(
		2,
		expect.stringMatching(/^[a-f0-9]{64}$/),
		expect.any(Date),
		expect.any(Number),
	);
	expect(mockSendMail).toHaveBeenCalledWith(
		expect.objectContaining({
			to: 'ada@example.com',
			subject: 'Dein Anmeldelink für Social Income',
			text: 'Eine Anmelde-E-Mail wurde versendet. Der einmalige Link ist in diesem Archiv [REDACTED].',
			sensitive: true,
			template: {
				id: 'd-login-template',
				data: {
					subject: 'Dein Anmeldelink für Social Income',
					logoUrl: 'https://socialincome.org/assets/logos_si/logo_color@2x.png',
					previewText: 'Mit diesem einmaligen Link kannst du dich bei Social Income anmelden.',
					heading: 'Bei Social Income anmelden',
					body: 'Klicke unten, um dich sicher bei deinem Social-Income-Konto anzumelden.',
					buttonText: 'Anmelden',
					magicLink: 'https://example.org/?oobCode=one-time-token',
					securityNotice: 'Zu deiner Sicherheit kann dieser Link nur einmal verwendet werden.',
					ignoreNotice: 'Wenn du diese E-Mail nicht angefordert hast, kannst du sie einfach ignorieren.',
					footer: 'Social Income · Bedingungsloses Grundeinkommen',
				},
			},
		}),
	);
});

test('does not generate or send links after the email or IP request limit is exceeded', async () => {
	mockIncrementMagicLinkRateLimit.mockResolvedValueOnce(4).mockResolvedValueOnce(1);

	await expect(
		sendMagicLoginLink({
			email: 'ada@example.com',
			continueUrl: 'https://socialincome.org/en/usd/auth/confirm-login?email=ada%40example.com',
			requestOrigin: 'https://socialincome.org',
			requesterIp: '203.0.113.12',
		}),
	).resolves.toEqual(resultFail('magic-link-rate-limited'));

	expect(mockIncrementMagicLinkRateLimit).toHaveBeenCalledTimes(2);
	expect(mockGenerateFirebaseSignInLink).not.toHaveBeenCalled();
	expect(mockSendMail).not.toHaveBeenCalled();
});

test('applies the per-IP limit even when requests target different email addresses', async () => {
	mockIncrementMagicLinkRateLimit.mockResolvedValueOnce(1).mockResolvedValueOnce(21);

	await expect(
		sendMagicLoginLink({
			email: 'ada@example.com',
			continueUrl: 'https://socialincome.org/en/usd/auth/confirm-login?email=ada%40example.com',
			requestOrigin: 'https://socialincome.org',
			requesterIp: '203.0.113.12',
		}),
	).resolves.toEqual(resultFail('magic-link-rate-limited'));

	expect(mockIncrementMagicLinkRateLimit).toHaveBeenCalledTimes(2);
	expect(mockGenerateFirebaseSignInLink).not.toHaveBeenCalled();
	expect(mockSendMail).not.toHaveBeenCalled();
});

test('shares the per-IP rate limit across addresses in the same IPv6 /64', async () => {
	const continueUrl = 'https://socialincome.org/en/usd/auth/confirm-login?email=ada%40example.com';
	const expectedIpKey = createHmac('sha256', 'test-service-account-secret').update('ip:2001:0db8:0001:0002').digest('hex');

	await sendMagicLoginLink({
		email: 'ada@example.com',
		continueUrl,
		requestOrigin: 'https://socialincome.org',
		requesterIp: '2001:db8:1:2::1',
	});
	expect(mockIncrementMagicLinkRateLimit).toHaveBeenNthCalledWith(2, expectedIpKey, expect.any(Date), expect.any(Number));

	await sendMagicLoginLink({
		email: 'ada@example.com',
		continueUrl,
		requestOrigin: 'https://socialincome.org',
		requesterIp: '2001:0db8:0001:0002:ffff:ffff:ffff:0007',
	});
	expect(mockIncrementMagicLinkRateLimit).toHaveBeenNthCalledWith(4, expectedIpKey, expect.any(Date), expect.any(Number));
});

test('scopes the per-email limit to the requester IP to avoid cross-IP lockouts', async () => {
	const request = {
		email: 'ada@example.com',
		continueUrl: 'https://socialincome.org/en/usd/auth/confirm-login?email=ada%40example.com',
		requestOrigin: 'https://socialincome.org',
	};
	const firstIpKey = createHmac('sha256', 'test-service-account-secret').update('ip:203.0.113.12').digest('hex');
	const secondIpKey = createHmac('sha256', 'test-service-account-secret').update('ip:203.0.113.13').digest('hex');
	const firstEmailKey = createHmac('sha256', 'test-service-account-secret')
		.update(`email:ada@example.com:${firstIpKey}`)
		.digest('hex');
	const secondEmailKey = createHmac('sha256', 'test-service-account-secret')
		.update(`email:ada@example.com:${secondIpKey}`)
		.digest('hex');

	await sendMagicLoginLink({ ...request, requesterIp: '203.0.113.12' });
	await sendMagicLoginLink({ ...request, requesterIp: '203.0.113.13' });

	expect(mockIncrementMagicLinkRateLimit).toHaveBeenNthCalledWith(1, firstEmailKey, expect.any(Date), expect.any(Number));
	expect(mockIncrementMagicLinkRateLimit).toHaveBeenNthCalledWith(3, secondEmailKey, expect.any(Date), expect.any(Number));
});

test('alerts when required magic-link configuration is missing', async () => {
	delete process.env.SENDGRID_MAGIC_LOGIN_TEMPLATE_ID;

	await expect(
		sendMagicLoginLink({
			email: 'ada@example.com',
			continueUrl: 'https://socialincome.org/en/usd/auth/confirm-login?email=ada%40example.com',
			requestOrigin: 'https://socialincome.org',
		}),
	).resolves.toEqual(resultFail('Could not send sign-in link'));

	expect(mockSendSlackAlert).toHaveBeenCalledWith('Magic-link email configuration is incomplete', {
		missingTemplateId: true,
		missingRateLimitSecret: false,
	});
});

test('does not log a failed SendGrid delivery with the generated sign-in link', async () => {
	const signInLink = 'https://example.org/?oobCode=one-time-token';
	const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
	mockSendMail.mockResolvedValue(resultFail('Could not send email'));

	await expect(
		sendMagicLoginLink({
			email: 'ada@example.com',
			continueUrl: 'https://socialincome.org/en/usd/auth/confirm-login?email=ada%40example.com',
			requestOrigin: 'https://socialincome.org',
		}),
	).resolves.toEqual(resultFail('Could not send sign-in link'));

	expect(consoleError.mock.calls.flat().join(' ')).not.toContain(signInLink);
	consoleError.mockRestore();
});

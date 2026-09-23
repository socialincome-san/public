import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';

export const turnstileSiteverifyUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

const SITEVERIFY_TIMEOUT_MS = 10_000;

const hasSuccessFlag = (value: unknown): value is { success: boolean } => {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	return 'success' in value && typeof value.success === 'boolean';
};

export const verifyTurnstileToken = async (token: string | null): Promise<ServiceResult<void>> => {
	const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
	if (!secret) {
		console.error('TURNSTILE_SECRET_KEY is missing');

		return resultFail('turnstile-invalid');
	}

	if (!token) {
		return resultFail('turnstile-required');
	}

	try {
		const response = await fetch(turnstileSiteverifyUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({ secret, response: token }),
			cache: 'no-store',
			signal: AbortSignal.timeout(SITEVERIFY_TIMEOUT_MS),
		});

		if (!response.ok) {
			console.error('Turnstile siteverify request failed', { status: response.status });

			return resultFail('submission-failed');
		}

		const payload: unknown = await response.json();
		if (!hasSuccessFlag(payload)) {
			console.error('Turnstile siteverify returned an unexpected payload');

			return resultFail('submission-failed');
		}

		if (!payload.success) {
			return resultFail('turnstile-invalid');
		}

		return resultOk(undefined);
	} catch (error) {
		console.error(error);

		return resultFail('submission-failed');
	}
};

import { logger } from '@/lib/utils/logger';
import type { CampaignSubmissionErrorCode } from './campaign-submission-input';
import { turnstileResponseFieldName } from './turnstile-field';

export const turnstileSiteverifyUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

const SITEVERIFY_TIMEOUT_MS = 10_000;

type TurnstileVerificationErrorCode = Extract<
	CampaignSubmissionErrorCode,
	'turnstile-required' | 'turnstile-invalid' | 'submission-failed'
>;

export type TurnstileVerificationResult = { success: true } | { success: false; error: TurnstileVerificationErrorCode };

const hasSuccessFlag = (value: unknown): value is { success: boolean } => {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	return 'success' in value && typeof value.success === 'boolean';
};

export const readTurnstileToken = (formData: FormData): string | null => {
	const value = formData.get(turnstileResponseFieldName);
	if (typeof value !== 'string') {
		return null;
	}

	const trimmed = value.trim();

	return trimmed.length > 0 ? trimmed : null;
};

export const verifyTurnstileToken = async (token: string | null): Promise<TurnstileVerificationResult> => {
	const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
	if (!secret) {
		logger.error('TURNSTILE_SECRET_KEY is missing');

		return { success: false, error: 'turnstile-invalid' };
	}

	if (!token) {
		return { success: false, error: 'turnstile-required' };
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
			logger.error('Turnstile siteverify request failed', { status: response.status });

			return { success: false, error: 'submission-failed' };
		}

		const payload: unknown = await response.json();
		if (!hasSuccessFlag(payload)) {
			logger.error('Turnstile siteverify returned an unexpected payload');

			return { success: false, error: 'submission-failed' };
		}

		if (!payload.success) {
			return { success: false, error: 'turnstile-invalid' };
		}

		return { success: true };
	} catch (error) {
		logger.error(error);

		return { success: false, error: 'submission-failed' };
	}
};

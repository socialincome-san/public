import { logger } from '@/lib/utils/logger';
import type { CampaignSubmissionErrorCode } from './campaign-submission-input';
import { turnstileResponseFieldName } from './turnstile-field';

export const turnstileSiteverifyUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

const SITEVERIFY_TIMEOUT_MS = 10_000;

type TurnstileSiteverifyResponse = {
	success: boolean;
	'error-codes'?: string[];
};

type TurnstileVerificationErrorCode = Extract<
	CampaignSubmissionErrorCode,
	'turnstile-required' | 'turnstile-invalid' | 'submission-failed'
>;

export type TurnstileVerificationResult = { success: true } | { success: false; error: TurnstileVerificationErrorCode };

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const parseSiteverifyResponse = (value: unknown): TurnstileSiteverifyResponse | null => {
	if (!isRecord(value) || typeof value.success !== 'boolean') {
		return null;
	}

	const errorCodes = value['error-codes'];
	if (errorCodes === undefined) {
		return { success: value.success };
	}

	if (!Array.isArray(errorCodes) || errorCodes.some((code) => typeof code !== 'string')) {
		return null;
	}

	return { success: value.success, 'error-codes': errorCodes };
};

const getTurnstileSecretKey = () => process.env.TURNSTILE_SECRET_KEY?.trim();

const getTurnstileSiteKey = () => process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();

export const readTurnstileToken = (formData: FormData): string | null => {
	const value = formData.get(turnstileResponseFieldName);
	if (typeof value !== 'string') {
		return null;
	}

	const trimmed = value.trim();

	return trimmed.length > 0 ? trimmed : null;
};

export const verifyTurnstileToken = async (token: string | null): Promise<TurnstileVerificationResult> => {
	const secret = getTurnstileSecretKey();
	if (!secret) {
		if (getTurnstileSiteKey()) {
			logger.error('TURNSTILE_SECRET_KEY is missing while NEXT_PUBLIC_TURNSTILE_SITE_KEY is set');

			return { success: false, error: 'submission-failed' };
		}

		return { success: true };
	}

	if (!token) {
		return { success: false, error: 'turnstile-required' };
	}

	try {
		const body = new URLSearchParams({
			secret,
			response: token,
		});

		const response = await fetch(turnstileSiteverifyUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body,
			cache: 'no-store',
			signal: AbortSignal.timeout(SITEVERIFY_TIMEOUT_MS),
		});

		if (!response.ok) {
			logger.error('Turnstile siteverify request failed', { status: response.status });

			return { success: false, error: 'submission-failed' };
		}

		const payload = parseSiteverifyResponse(await response.json());
		if (!payload) {
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

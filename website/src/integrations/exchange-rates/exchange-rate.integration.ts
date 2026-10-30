import { resultFail, resultOk, type Result } from '@/lib/result';

const ETHERSCAN_API_URL = 'https://api.etherscan.io/v2/api';
const FIAT_MAX_ATTEMPTS = 5;
const FIAT_RETRY_DELAY_MS = 2000;
const FIAT_REQUEST_TIMEOUT_MS = 10_000;

export type FiatExchangeRateResponse = {
	base: string;
	date: string;
	rates: Record<string, number>;
};

export const fetchFiatExchangeRates = async (
	day: string,
	deadline = Date.now() + 45_000,
): Promise<Result<FiatExchangeRateResponse>> => {
	const apiKey = process.env.EXCHANGE_RATES_API?.trim();
	if (!apiKey) {
		return resultFail('Exchange rates API is not configured');
	}

	let retryDelay = FIAT_RETRY_DELAY_MS;
	for (let attempt = 1; attempt <= FIAT_MAX_ATTEMPTS; attempt += 1) {
		if (deadline - Date.now() <= (attempt > 1 ? retryDelay : 0)) {
			console.error('Exchange rate import time budget exceeded', { day, attempt });

			return resultFail('Exchange rate import time budget exceeded');
		}
		if (attempt > 1) {
			await new Promise((resolve) => setTimeout(resolve, retryDelay));
		}
		const remainingTime = deadline - Date.now();
		if (remainingTime <= 0) {
			return resultFail('Exchange rate import time budget exceeded');
		}

		retryDelay = FIAT_RETRY_DELAY_MS;
		let response: Response;
		try {
			response = await fetch(`https://api.apilayer.com/exchangerates_data/${day}?base=chf`, {
				method: 'GET',
				headers: { apiKey },
				signal: AbortSignal.timeout(Math.min(FIAT_REQUEST_TIMEOUT_MS, remainingTime)),
			});
		} catch (error) {
			if (attempt === FIAT_MAX_ATTEMPTS) {
				console.error('Could not fetch exchange rates', { day, attempt, error });

				return resultFail('Could not fetch exchange rates');
			}

			console.warn('Could not fetch exchange rates; retrying', { day, attempt, error });
			continue;
		}

		if (!response.ok) {
			const context = { day, attempt, status: response.status, statusText: response.statusText };
			await response.body?.cancel().catch((error: unknown) => {
				console.warn('Could not cancel exchange rates response body', { ...context, error });
			});
			const retryable = response.status === 408 || response.status === 429 || response.status >= 500;
			if (!retryable || attempt === FIAT_MAX_ATTEMPTS) {
				console.error('Exchange rates provider request failed', context);

				return resultFail('Exchange rates provider request failed');
			}

			const retryAfter = response.headers?.get('Retry-After')?.trim();
			if (response.status === 429 && retryAfter) {
				const seconds = Number(retryAfter);
				const delay = Number.isFinite(seconds) ? seconds * 1000 : Math.max(0, Date.parse(retryAfter) - Date.now());
				if (Number.isFinite(delay) && delay >= 0) {
					retryDelay = delay;
				}
			}
			console.warn('Exchange rates provider request failed; retrying', { ...context, retryDelay });
			continue;
		}

		let data: unknown;
		try {
			data = await response.json();
		} catch (error) {
			console.error('Exchange rates provider returned an invalid response', { day, attempt, error });

			return resultFail('Exchange rates provider returned an invalid response');
		}
		if (!isFiatExchangeRateResponse(data)) {
			console.error('Exchange rates provider returned an invalid response', { day, attempt });

			return resultFail('Exchange rates provider returned an invalid response');
		}

		return resultOk(data);
	}

	return resultFail('Could not fetch exchange rates');
};

export const fetchEthUsdPrice = async (deadline = Date.now() + 10_000): Promise<Result<number>> => {
	const apiKey = process.env.ETHERSCAN_API_KEY?.trim();
	if (!apiKey) {
		return resultFail('Etherscan API is not configured');
	}

	const parameters = new URLSearchParams({
		module: 'stats',
		action: 'ethprice',
		chainid: '1',
		apikey: apiKey,
	});

	try {
		const remainingTime = deadline - Date.now();
		if (remainingTime <= 0) {
			return resultFail('Exchange rate import time budget exceeded');
		}
		const response = await fetch(`${ETHERSCAN_API_URL}?${parameters.toString()}`, {
			method: 'GET',
			signal: AbortSignal.timeout(Math.min(10_000, remainingTime)),
		});
		if (!response.ok) {
			console.error('Etherscan request failed', {
				status: response.status,
				statusText: response.statusText,
			});

			return resultFail('Etherscan request failed');
		}

		const data: unknown = await response.json();
		if (!isEtherscanEthPriceResponse(data)) {
			console.error('Etherscan returned an invalid response');

			return resultFail('Etherscan returned an invalid response');
		}

		const ethUsdPrice = Number(data.result.ethusd);
		if (data.status !== '1' || !Number.isFinite(ethUsdPrice) || ethUsdPrice <= 0) {
			console.error('Etherscan returned an invalid ETH price', { message: data.message });

			return resultFail('Etherscan returned an invalid ETH price');
		}

		return resultOk(ethUsdPrice);
	} catch (error) {
		console.error('Could not fetch ETH price', { error });

		return resultFail('Could not fetch ETH price');
	}
};

const isFiatExchangeRateResponse = (value: unknown): value is FiatExchangeRateResponse => {
	if (
		typeof value !== 'object' ||
		value === null ||
		!('base' in value) ||
		typeof value.base !== 'string' ||
		!('date' in value) ||
		typeof value.date !== 'string' ||
		!('rates' in value) ||
		typeof value.rates !== 'object' ||
		value.rates === null
	) {
		return false;
	}

	return Object.values(value.rates).every((rate) => typeof rate === 'number' && Number.isFinite(rate));
};

const isEtherscanEthPriceResponse = (
	value: unknown,
): value is { status: string; message: string; result: { ethusd: string } } =>
	typeof value === 'object' &&
	value !== null &&
	'status' in value &&
	typeof value.status === 'string' &&
	'message' in value &&
	typeof value.message === 'string' &&
	'result' in value &&
	typeof value.result === 'object' &&
	value.result !== null &&
	'ethusd' in value.result &&
	typeof value.result.ethusd === 'string';

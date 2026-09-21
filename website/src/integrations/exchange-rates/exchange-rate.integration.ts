import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';

const ETHERSCAN_API_URL = 'https://api.etherscan.io/v2/api';

export type FiatExchangeRateResponse = {
	base: string;
	date: string;
	rates: Record<string, number>;
};

export const fetchFiatExchangeRates = async (day: string): Promise<ServiceResult<FiatExchangeRateResponse>> => {
	const apiKey = process.env.EXCHANGE_RATES_API?.trim();
	if (!apiKey) {
		return resultFail('Exchange rates API is not configured');
	}

	try {
		const response = await fetch(`https://api.apilayer.com/exchangerates_data/${day}?base=chf`, {
			method: 'GET',
			headers: { apiKey },
		});
		if (!response.ok) {
			console.error('Exchange rates provider request failed', {
				day,
				status: response.status,
				statusText: response.statusText,
			});

			return resultFail('Exchange rates provider request failed');
		}

		const data: unknown = await response.json();
		if (!isFiatExchangeRateResponse(data)) {
			console.error('Exchange rates provider returned an invalid response', { day });

			return resultFail('Exchange rates provider returned an invalid response');
		}

		return resultOk(data);
	} catch (error) {
		console.error('Could not fetch exchange rates', { day, error });

		return resultFail('Could not fetch exchange rates');
	}
};

export const fetchEthUsdPrice = async (): Promise<ServiceResult<number>> => {
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
		const response = await fetch(`${ETHERSCAN_API_URL}?${parameters.toString()}`, { method: 'GET' });
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

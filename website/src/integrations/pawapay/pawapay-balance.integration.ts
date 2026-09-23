import { Currency } from '@/generated/prisma/enums';
import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';

const PAWAPAY_BALANCES_URL = 'https://api.pawapay.io/v2/wallet-balances';

export type PawaPayBalance = {
	country: string;
	provider: string;
	amount: number;
	currency: Currency;
};

export const fetchPawaPayBalances = async (): Promise<ServiceResult<PawaPayBalance[]>> => {
	const token = process.env.PAWAPAY_API_TOKEN?.trim();
	if (!token) {
		return resultFail('PawaPay API token is not configured');
	}

	try {
		const response = await fetch(PAWAPAY_BALANCES_URL, {
			method: 'GET',
			headers: { Authorization: `Bearer ${token}` },
		});
		if (!response.ok) {
			console.error('PawaPay balance request failed', {
				status: response.status,
				statusText: response.statusText,
			});

			return resultFail('PawaPay balance request failed');
		}

		const data: unknown = await response.json();
		if (!isPawaPayResponse(data)) {
			return resultFail('Invalid PawaPay balance response');
		}

		const balances: PawaPayBalance[] = [];
		for (const balance of data.balances) {
			const country = balance.country.trim();
			const provider = balance.provider.trim();
			const balanceValue = balance.balance.trim();
			const amount = Number(balanceValue);
			const currency = parseCurrency(balance.currency);
			if (!country || !balanceValue || !Number.isFinite(amount) || !currency) {
				console.error('PawaPay returned an invalid balance', {
					country: balance.country,
					provider: balance.provider,
				});

				return resultFail('PawaPay returned an invalid balance');
			}

			balances.push({ country, provider, amount, currency });
		}

		return resultOk(balances);
	} catch (error) {
		console.error('Could not get PawaPay balances', { error });

		return resultFail('Could not get PawaPay balances');
	}
};

const isPawaPayResponse = (value: unknown): value is { balances: PawaPayApiBalance[] } => {
	if (!value || typeof value !== 'object' || !('balances' in value) || !Array.isArray(value.balances)) {
		return false;
	}

	return value.balances.every(isPawaPayApiBalance);
};

const isPawaPayApiBalance = (value: unknown): value is PawaPayApiBalance =>
	typeof value === 'object' &&
	value !== null &&
	'country' in value &&
	typeof value.country === 'string' &&
	'balance' in value &&
	typeof value.balance === 'string' &&
	'currency' in value &&
	typeof value.currency === 'string' &&
	'provider' in value &&
	typeof value.provider === 'string';

const parseCurrency = (value: string): Currency | undefined =>
	Object.values(Currency).find((currency) => currency === value);

type PawaPayApiBalance = {
	country: string;
	balance: string;
	currency: string;
	provider: string;
};

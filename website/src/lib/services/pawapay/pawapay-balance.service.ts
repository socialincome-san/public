import { Currency, type PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { BaseService } from '../core/base.service';
import { type ServiceResult } from '../core/base.types';
import { type PawaPayBalance } from './pawapay-balance.types';

const PAWAPAY_BALANCES_URL = 'https://api.pawapay.io/v2/wallet-balances';

type PawaPayApiBalance = {
	country: string;
	balance: string;
	currency: string;
};

export class PawaPayBalanceService extends BaseService {
	constructor(db: PrismaClient, loggerInstance = logger) {
		super(db, loggerInstance);
	}

	async getLatestBalances(): Promise<ServiceResult<PawaPayBalance[]>> {
		const token = process.env.PAWAPAY_API_TOKEN?.trim();
		if (!token) {
			return this.resultFail('PawaPay API token is not configured');
		}

		try {
			const response = await fetch(PAWAPAY_BALANCES_URL, {
				method: 'GET',
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!response.ok) {
				return this.resultFail(`PawaPay balance request failed: ${response.status} ${response.statusText}`);
			}

			const data: unknown = await response.json();
			if (!this.isPawaPayResponse(data)) {
				return this.resultFail('Invalid PawaPay balance response');
			}

			const balances: PawaPayBalance[] = [];
			for (const balance of data.balances) {
				const amount = Number(balance.balance);
				if (!Number.isFinite(amount) || !this.isCurrency(balance.currency)) {
					return this.resultFail(`Invalid PawaPay balance for country ${balance.country}`);
				}

				balances.push({
					country: balance.country,
					amount,
					currency: balance.currency,
				});
			}

			return this.resultOk(balances);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not get PawaPay balances: ${JSON.stringify(error)}`);
		}
	}

	private isPawaPayResponse = (value: unknown): value is { balances: PawaPayApiBalance[] } => {
		if (!value || typeof value !== 'object' || !('balances' in value) || !Array.isArray(value.balances)) {
			return false;
		}

		return value.balances.every((balance: unknown) => this.isPawaPayApiBalance(balance));
	};

	private isPawaPayApiBalance = (value: unknown): value is PawaPayApiBalance =>
		typeof value === 'object' &&
		value !== null &&
		'country' in value &&
		typeof value.country === 'string' &&
		'balance' in value &&
		typeof value.balance === 'string' &&
		'currency' in value &&
		typeof value.currency === 'string';

	private isCurrency = (value: string): value is Currency => Object.values(Currency).some((currency) => currency === value);
}

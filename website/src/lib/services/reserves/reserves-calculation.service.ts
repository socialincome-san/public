import { BankAccountType, Currency, type PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { type BankAccountReadService } from '../bank-account/bank-account-read.service';
import { BaseService } from '../core/base.service';
import { type ServiceResult } from '../core/base.types';
import { type CurrencyDisplayService } from '../currency-display/currency-display.service';
import { type PostFinanceBalanceService } from '../payment-file-import/postfinance-balance.service';
import { type ReserveWriteService } from './reserve-write.service';
import { type ReserveCreateInput } from './reserve.types';

export class ReservesCalculationService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly bankAccountService: BankAccountReadService,
		private readonly postFinanceBalanceService: PostFinanceBalanceService,
		private readonly reserveWriteService: ReserveWriteService,
		private readonly currencyDisplayService: CurrencyDisplayService,
		loggerInstance = logger,
	) {
		super(db, loggerInstance);
	}

	async calculate(): Promise<ServiceResult<number>> {
		const bankAccountsResult = await this.bankAccountService.getAll();
		if (!bankAccountsResult.success) {
			return bankAccountsResult;
		}

		const postFinanceAccounts = bankAccountsResult.data.filter(({ type }) => {
			switch (type) {
				case BankAccountType.postfinance:
					return true;
				default:
					this.logger.info(`Skipped reserve calculation for unsupported bank account type ${type}`);

					return false;
			}
		});

		if (postFinanceAccounts.length === 0) {
			return this.resultOk(0);
		}

		const balancesResult = await this.postFinanceBalanceService.getLatestClavBalances(
			postFinanceAccounts.map(({ bankAccountNumber }) => bankAccountNumber),
		);
		if (!balancesResult.success) {
			return balancesResult;
		}

		const rates = balancesResult.data.some(({ currency }) => currency !== Currency.CHF)
			? await this.currencyDisplayService.getLatestRatesOrUndefined()
			: undefined;
		const balancesByIban = new Map(balancesResult.data.map((balance) => [this.normalizeIban(balance.iban), balance]));
		const now = new Date();
		const calculationDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
		const reserves: ReserveCreateInput[] = [];

		for (const account of postFinanceAccounts) {
			const balance = balancesByIban.get(this.normalizeIban(account.bankAccountNumber));
			if (!balance) {
				return this.resultFail(`Missing PostFinance balance for bank account ${account.id}`);
			}

			const amountChf = this.currencyDisplayService.convertAmount(balance.amount, balance.currency, Currency.CHF, rates);
			if (amountChf === undefined) {
				return this.resultFail(`Could not convert ${balance.currency} reserve for bank account ${account.id} to CHF`);
			}

			reserves.push({
				bankAccountId: account.id,
				date: calculationDate,
				amount: balance.amount,
				currency: balance.currency,
				amountChf,
			});
		}

		return this.reserveWriteService.createMany(reserves);
	}

	private normalizeIban = (iban: string): string => iban.replaceAll(/\s/g, '').toUpperCase();
}

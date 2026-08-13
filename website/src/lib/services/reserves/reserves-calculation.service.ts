import { BankAccountType, Currency, type BankAccount, type PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { type BankAccountReadService } from '../bank-account/bank-account-read.service';
import { type BankAccountWriteService } from '../bank-account/bank-account-write.service';
import { BaseService } from '../core/base.service';
import { type ServiceResult } from '../core/base.types';
import { type CurrencyDisplayService } from '../currency-display/currency-display.service';
import { type ExchangeRates } from '../exchange-rate/exchange-rate.types';
import { type PawaPayBalanceService } from '../pawapay/pawapay-balance.service';
import { type PostFinanceBalanceService } from '../payment-file-import/postfinance-balance.service';
import { type ReserveWriteService } from './reserve-write.service';
import { type ReserveCreateInput } from './reserve.types';

export class ReservesCalculationService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly bankAccountReadService: BankAccountReadService,
		private readonly bankAccountWriteService: BankAccountWriteService,
		private readonly postFinanceBalanceService: PostFinanceBalanceService,
		private readonly pawaPayBalanceService: PawaPayBalanceService,
		private readonly reserveWriteService: ReserveWriteService,
		private readonly currencyDisplayService: CurrencyDisplayService,
		loggerInstance = logger,
	) {
		super(db, loggerInstance);
	}

	async calculate(): Promise<ServiceResult<number>> {
		const bankAccountsResult = await this.bankAccountReadService.getAll();
		if (!bankAccountsResult.success) {
			return bankAccountsResult;
		}

		const postFinanceAccounts: (BankAccount & { bankAccountNumber: string })[] = [];
		for (const account of bankAccountsResult.data) {
			if (account.type === BankAccountType.postfinance) {
				if (!account.bankAccountNumber) {
					return this.resultFail(`Missing bank account number for PostFinance account ${account.id}`);
				}
				postFinanceAccounts.push({ ...account, bankAccountNumber: account.bankAccountNumber });
			} else if (account.type !== BankAccountType.pawapay_wallet) {
				this.logger.info(`Skipped reserve calculation for unsupported bank account type ${account.type}`);
			}
		}

		const [postFinanceBalancesResult, pawaPayBalancesResult] = await Promise.all([
			postFinanceAccounts.length > 0
				? this.postFinanceBalanceService.getLatestBalances(
						postFinanceAccounts.map(({ bankAccountNumber }) => bankAccountNumber),
					)
				: Promise.resolve(this.resultOk([])),
			this.pawaPayBalanceService.getLatestBalances(),
		]);
		if (!postFinanceBalancesResult.success) {
			return postFinanceBalancesResult;
		}
		if (!pawaPayBalancesResult.success) {
			return pawaPayBalancesResult;
		}

		const pawaPayAccountsResult = await this.bankAccountWriteService.ensurePawaPayWallets(
			pawaPayBalancesResult.data.map(({ country }) => country),
		);
		if (!pawaPayAccountsResult.success) {
			return pawaPayAccountsResult;
		}

		const allBalances = [...postFinanceBalancesResult.data, ...pawaPayBalancesResult.data];
		const rates = allBalances.some(({ currency }) => currency !== Currency.CHF)
			? await this.currencyDisplayService.getLatestRatesOrUndefined()
			: undefined;
		const balancesByIban = new Map(
			postFinanceBalancesResult.data.map((balance) => [this.normalizeIban(balance.iban), balance]),
		);
		const now = new Date();
		const calculationDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
		const reserves: ReserveCreateInput[] = [];

		for (const account of postFinanceAccounts) {
			const balance = balancesByIban.get(this.normalizeIban(account.bankAccountNumber));
			if (!balance) {
				return this.resultFail(`Missing PostFinance balance for bank account ${account.id}`);
			}

			const reserve = this.toReserveInput(account.id, calculationDate, balance.amount, balance.currency, rates);
			if (!reserve.success) {
				return reserve;
			}
			reserves.push(reserve.data);
		}

		const pawaPayAccountsByCountry = new Map(pawaPayAccountsResult.data.map((account) => [account.description, account]));
		for (const balance of pawaPayBalancesResult.data) {
			const account = pawaPayAccountsByCountry.get(balance.country);
			if (!account) {
				return this.resultFail(`Missing PawaPay wallet bank account for country ${balance.country}`);
			}

			const reserve = this.toReserveInput(account.id, calculationDate, balance.amount, balance.currency, rates);
			if (!reserve.success) {
				return reserve;
			}
			reserves.push(reserve.data);
		}

		return this.reserveWriteService.createMany(reserves);
	}

	private toReserveInput = (
		bankAccountId: string,
		date: Date,
		amount: number,
		currency: Currency,
		rates: ExchangeRates | undefined,
	): ServiceResult<ReserveCreateInput> => {
		const amountChf = this.currencyDisplayService.convertAmount(amount, currency, Currency.CHF, rates);
		if (amountChf === undefined) {
			return this.resultFail(`Could not convert ${currency} reserve for bank account ${bankAccountId} to CHF`);
		}

		return this.resultOk({ bankAccountId, date, amount, currency, amountChf });
	};

	private normalizeIban = (iban: string): string => iban.replaceAll(/\s/g, '').toUpperCase();
}

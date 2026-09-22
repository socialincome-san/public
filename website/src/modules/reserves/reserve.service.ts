import { BankAccountType, Currency } from '@/generated/prisma/enums';
import {
	fetchCustodianStablecoinWalletBalances,
	type CustodianStablecoinWalletBalance,
} from '@/integrations/etherscan/etherscan-balance.integration';
import { fetchPawaPayBalances, type PawaPayBalance } from '@/integrations/pawapay/pawapay-balance.integration';
import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import {
	ensurePawaPayWallets,
	getBankAccounts,
	getBankAccountSummaries,
} from '@/modules/bank-accounts/bank-account.service';
import type { BankAccountRecord } from '@/modules/bank-accounts/bank-account.types';
import { convertAmount } from '@/modules/currency-display/currency-display.service';
import { getLatestRates } from '@/modules/exchange-rates/exchange-rate.service';
import type { ExchangeRates } from '@/modules/exchange-rates/exchange-rate.types';
import { getLatestPostFinanceBalances } from '@/modules/payment-imports/payment-import.service';
import type { PostFinanceBalance } from '@/modules/payment-imports/payment-import.types';
import * as reserveRepository from './reserve.repository';
import type { BankAccountLatestReserve, LatestReserves, ReserveCreateInput } from './reserve.types';

export const getLatestReserves = async (): Promise<ServiceResult<LatestReserves>> => {
	try {
		const latestDates = await reserveRepository.groupLatestReserveDates();
		const latestReserveFilters = latestDates.flatMap(({ bankAccountId, _max: { date } }) =>
			date ? [{ bankAccountId, date }] : [],
		);
		const [bankAccountsResult, latestReserves] = await Promise.all([
			getBankAccountSummaries(),
			latestReserveFilters.length > 0
				? reserveRepository.findReservesByAccountAndDate(latestReserveFilters)
				: Promise.resolve([]),
		]);
		if (!bankAccountsResult.success) {
			return resultFail(bankAccountsResult.error);
		}

		const latestTotalsByBankAccount = new Map<string, { amountChf: number; recordedAt: Date }>();
		for (const reserve of latestReserves) {
			const current = latestTotalsByBankAccount.get(reserve.bankAccountId);
			latestTotalsByBankAccount.set(reserve.bankAccountId, {
				amountChf: (current?.amountChf ?? 0) + Number(reserve.amountChf),
				recordedAt: current && current.recordedAt > reserve.createdAt ? current.recordedAt : reserve.createdAt,
			});
		}

		const accounts: BankAccountLatestReserve[] = bankAccountsResult.data.map(({ id, bankAccountNumber, description }) => {
			const latestReserve = latestTotalsByBankAccount.get(id);

			return {
				bankAccountId: id,
				bankAccountNumber,
				description,
				amountChf: latestReserve?.amountChf ?? null,
				recordedAt: latestReserve?.recordedAt ?? null,
			};
		});

		return resultOk({
			accounts,
			total: accounts.reduce((total, { amountChf }) => total + (amountChf ?? 0), 0),
		});
	} catch (error) {
		console.error('Could not get latest reserves', { error });

		return resultFail('Could not get latest reserves');
	}
};

export const calculateReserves = async (bucketName: string): Promise<ServiceResult<number>> => {
	const bankAccountsResult = await getBankAccounts();
	if (!bankAccountsResult.success) {
		return resultFail(bankAccountsResult.error);
	}

	const postFinanceAccounts: BankAccountWithNumber[] = [];
	const custodianAccounts: BankAccountWithNumber[] = [];
	for (const account of bankAccountsResult.data) {
		if (account.type === BankAccountType.postfinance) {
			if (!account.bankAccountNumber) {
				console.error('PostFinance account is missing a bank account number', { bankAccountId: account.id });

				return resultFail('PostFinance account is missing a bank account number');
			}
			postFinanceAccounts.push({ ...account, bankAccountNumber: account.bankAccountNumber });
		} else if (account.type === BankAccountType.custodian_stablecoin_wallet) {
			const address = account.bankAccountNumber?.trim();
			if (!address) {
				console.error('Custodian stablecoin account is missing a wallet address', { bankAccountId: account.id });

				return resultFail('Custodian stablecoin account is missing a wallet address');
			}
			custodianAccounts.push({ ...account, bankAccountNumber: address });
		} else if (account.type !== BankAccountType.pawapay_wallet) {
			console.info(`Skipped reserve calculation for unsupported bank account type ${account.type}`);
		}
	}

	const [postFinanceResult, pawaPayResult, custodianResult] = await Promise.all([
		postFinanceAccounts.length > 0
			? getLatestPostFinanceBalances(
					bucketName,
					postFinanceAccounts.map(({ bankAccountNumber }) => bankAccountNumber),
				)
			: Promise.resolve(resultOk<PostFinanceBalance[]>([])),
		fetchPawaPayBalances(),
		custodianAccounts.length > 0
			? fetchCustodianStablecoinWalletBalances(custodianAccounts.map(({ bankAccountNumber }) => bankAccountNumber))
			: Promise.resolve(resultOk<CustodianStablecoinWalletBalance[]>([])),
	]);
	if (!postFinanceResult.success) {
		return resultFail(postFinanceResult.error);
	}
	if (!pawaPayResult.success) {
		return resultFail(pawaPayResult.error);
	}
	if (!custodianResult.success) {
		return resultFail(custodianResult.error);
	}

	const pawaPayAccountsResult = await ensurePawaPayWallets(
		pawaPayResult.data.map(({ country, provider }) => pawaPayWalletKey(country, provider)),
	);
	if (!pawaPayAccountsResult.success) {
		return resultFail(pawaPayAccountsResult.error);
	}

	const rates = await getRequiredRates([...postFinanceResult.data, ...pawaPayResult.data, ...custodianResult.data]);
	const reservesResult = buildReserves({
		postFinanceAccounts,
		postFinanceBalances: postFinanceResult.data,
		pawaPayAccounts: pawaPayAccountsResult.data,
		pawaPayBalances: pawaPayResult.data,
		custodianAccounts,
		custodianBalances: custodianResult.data,
		rates,
	});
	if (!reservesResult.success) {
		return reservesResult;
	}

	try {
		if (reservesResult.data.length === 0) {
			return resultOk(0);
		}
		const { count } = await reserveRepository.createReserves(reservesResult.data);

		return resultOk(count);
	} catch (error) {
		console.error('Could not create reserves', { error });

		return resultFail('Could not create reserves');
	}
};

const buildReserves = ({
	postFinanceAccounts,
	postFinanceBalances,
	pawaPayAccounts,
	pawaPayBalances,
	custodianAccounts,
	custodianBalances,
	rates,
}: ReserveSources): ServiceResult<ReserveCreateInput[]> => {
	const balancesByIban = new Map(postFinanceBalances.map((balance) => [normalizeIban(balance.iban), balance]));
	const pawaPayAccountsByWalletKey = new Map(pawaPayAccounts.map((account) => [account.description, account]));
	const custodianBalancesByAddressAndCurrency = new Map(
		custodianBalances.map((balance) => [walletBalanceKey(balance.address, balance.currency), balance]),
	);
	const now = new Date();
	const calculationDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
	const reserves: ReserveCreateInput[] = [];

	for (const account of postFinanceAccounts) {
		const balance = balancesByIban.get(normalizeIban(account.bankAccountNumber));
		if (!balance) {
			console.error('PostFinance balance is missing for reserve calculation', { bankAccountId: account.id });

			return resultFail('PostFinance balance is missing for reserve calculation');
		}
		const reserve = toReserveInput(account.id, calculationDate, balance.amount, balance.currency, rates);
		if (!reserve.success) {
			return reserve;
		}
		reserves.push(reserve.data);
	}

	for (const balance of pawaPayBalances) {
		const walletKey = pawaPayWalletKey(balance.country, balance.provider);
		const account = pawaPayAccountsByWalletKey.get(walletKey);
		if (!account) {
			console.error('PawaPay wallet account is missing for reserve calculation', { walletKey });

			return resultFail('PawaPay wallet account is missing for reserve calculation');
		}
		const reserve = toReserveInput(account.id, calculationDate, balance.amount, balance.currency, rates);
		if (!reserve.success) {
			return reserve;
		}
		reserves.push(reserve.data);
	}

	for (const account of custodianAccounts) {
		for (const currency of [Currency.ETH, Currency.USD]) {
			const balance = custodianBalancesByAddressAndCurrency.get(walletBalanceKey(account.bankAccountNumber, currency));
			if (!balance) {
				console.error('Custodian wallet balance is missing for reserve calculation', {
					bankAccountId: account.id,
					currency,
				});

				return resultFail('Custodian wallet balance is missing for reserve calculation');
			}
			const reserve = toReserveInput(account.id, calculationDate, balance.amount, balance.currency, rates);
			if (!reserve.success) {
				return reserve;
			}
			reserves.push(reserve.data);
		}
	}

	return resultOk(reserves);
};

const getRequiredRates = async (balances: { currency: Currency }[]): Promise<ExchangeRates | undefined> => {
	if (!balances.some(({ currency }) => currency !== Currency.CHF)) {
		return undefined;
	}
	const ratesResult = await getLatestRates();

	return ratesResult.success ? ratesResult.data : undefined;
};

const toReserveInput = (
	bankAccountId: string,
	date: Date,
	amount: number,
	currency: Currency,
	rates: ExchangeRates | undefined,
): ServiceResult<ReserveCreateInput> => {
	const amountChf = convertAmount(amount, currency, Currency.CHF, rates);
	if (!amountChf.success) {
		console.error('Could not convert reserve amount to CHF', {
			bankAccountId,
			currency,
			error: amountChf.error,
		});

		return resultFail('Could not convert reserve amount to CHF');
	}

	return resultOk({ bankAccountId, date, amount, currency, amountChf: amountChf.data });
};

const pawaPayWalletKey = (country: string, provider: string): string => (provider ? `${country}:${provider}` : country);

const normalizeIban = (iban: string): string => iban.replaceAll(/\s/g, '').toUpperCase();

const walletBalanceKey = (address: string, currency: Currency): string => `${address.trim().toLowerCase()}:${currency}`;

type BankAccountWithNumber = BankAccountRecord & { bankAccountNumber: string };

type ReserveSources = {
	postFinanceAccounts: BankAccountWithNumber[];
	postFinanceBalances: PostFinanceBalance[];
	pawaPayAccounts: BankAccountRecord[];
	pawaPayBalances: PawaPayBalance[];
	custodianAccounts: BankAccountWithNumber[];
	custodianBalances: CustodianStablecoinWalletBalance[];
	rates: ExchangeRates | undefined;
};

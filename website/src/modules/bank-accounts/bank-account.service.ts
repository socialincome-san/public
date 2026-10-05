import { resultFail, resultOk, type Result } from '@/lib/result';
import * as bankAccountRepository from './bank-account.repository';
import type { BankAccountRecord, BankAccountSummary } from './bank-account.types';

export const getBankAccounts = async (): Promise<Result<BankAccountRecord[]>> => {
	try {
		return resultOk(await bankAccountRepository.findBankAccounts());
	} catch (error) {
		console.error('Could not get bank accounts', { error });

		return resultFail('Could not get bank accounts');
	}
};

export const getBankAccountSummaries = async (): Promise<Result<BankAccountSummary[]>> => {
	try {
		return resultOk(await bankAccountRepository.findBankAccountSummaries());
	} catch (error) {
		console.error('Could not get bank account summaries', { error });

		return resultFail('Could not get bank account summaries');
	}
};

export const ensurePawaPayWallets = async (walletKeys: string[]): Promise<Result<BankAccountRecord[]>> => {
	const uniqueWalletKeys = [...new Set(walletKeys)];
	if (uniqueWalletKeys.length === 0) {
		return resultOk([]);
	}

	try {
		const existingAccounts = await bankAccountRepository.findPawaPayWalletAccounts(uniqueWalletKeys);
		const existingWalletKeys = new Set(existingAccounts.map(({ description }) => description));
		const missingWalletKeys = uniqueWalletKeys.filter((walletKey) => !existingWalletKeys.has(walletKey));

		if (missingWalletKeys.length === 0) {
			return resultOk(existingAccounts);
		}

		await bankAccountRepository.createPawaPayWalletAccounts(missingWalletKeys);

		return resultOk(await bankAccountRepository.findPawaPayWalletAccounts(uniqueWalletKeys));
	} catch (error) {
		console.error('Could not ensure PawaPay wallet bank accounts', { error });

		return resultFail('Could not ensure PawaPay wallet bank accounts');
	}
};

import { BankAccountType } from '@/generated/prisma/enums';
import { prisma } from '@/lib/database/prisma';

export const findBankAccounts = async () =>
	prisma.bankAccount.findMany({
		select: bankAccountSelect,
	});

export const findBankAccountSummaries = async () =>
	prisma.bankAccount.findMany({
		select: {
			id: true,
			bankAccountNumber: true,
			description: true,
		},
	});

export const findPawaPayWalletAccounts = async (walletKeys: string[]) =>
	prisma.bankAccount.findMany({
		where: {
			type: BankAccountType.pawapay_wallet,
			description: { in: walletKeys },
		},
		select: bankAccountSelect,
	});

export const createPawaPayWalletAccounts = async (walletKeys: string[]) =>
	prisma.bankAccount.createMany({
		data: walletKeys.map((walletKey) => ({
			type: BankAccountType.pawapay_wallet,
			bankAccountNumber: null,
			description: walletKey,
		})),
	});

const bankAccountSelect = {
	id: true,
	type: true,
	bankAccountNumber: true,
	description: true,
	createdAt: true,
	updatedAt: true,
} as const;

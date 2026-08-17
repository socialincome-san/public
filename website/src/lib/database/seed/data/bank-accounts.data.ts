import { BankAccountType, type BankAccount } from '@/generated/prisma/client';

const createdAt = new Date('2025-01-01T13:00:00.000Z');

export const bankAccountsData: BankAccount[] = [
	{
		id: 'bank-account-postfinance-1',
		type: BankAccountType.postfinance,
		bankAccountNumber: 'CH1909000000151126386',
		description: null,
		createdAt,
		updatedAt: null,
	},
	{
		id: 'bank-account-postfinance-2',
		type: BankAccountType.postfinance,
		bankAccountNumber: 'CH9709000000169153887',
		description: null,
		createdAt,
		updatedAt: null,
	},
	{
		id: 'bank-account-postfinance-3',
		type: BankAccountType.postfinance,
		bankAccountNumber: 'CH5709000000154860881',
		description: null,
		createdAt,
		updatedAt: null,
	},
	{
		id: 'bank-account-custodian-stablecoin-wallet',
		type: BankAccountType.custodian_stablecoin_wallet,
		bankAccountNumber: '0x8050AEE96939f3321Ae6EBd519feE88Ef172f223',
		description: 'Custodian stablecoin wallet',
		createdAt,
		updatedAt: null,
	},
];

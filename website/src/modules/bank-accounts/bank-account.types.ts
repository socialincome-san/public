import type { BankAccountType } from '@/generated/prisma/enums';

export type BankAccountRecord = {
	id: string;
	type: BankAccountType;
	bankAccountNumber: string | null;
	description: string | null;
	createdAt: Date;
	updatedAt: Date | null;
};

export type BankAccountSummary = Pick<BankAccountRecord, 'id' | 'bankAccountNumber' | 'description'>;

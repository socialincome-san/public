import type { BankAccountType } from '@/generated/prisma/enums';
import type { ServiceResult } from '@/lib/service-result';

export type BankAccountRecord = {
	id: string;
	type: BankAccountType;
	bankAccountNumber: string | null;
	description: string | null;
	createdAt: Date;
	updatedAt: Date | null;
};

export type BankAccountReadService = {
	getAll: () => Promise<ServiceResult<BankAccountRecord[]>>;
};

export type BankAccountWriteService = {
	ensurePawaPayWallets: (walletKeys: string[]) => Promise<ServiceResult<BankAccountRecord[]>>;
};

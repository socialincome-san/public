import { Currency } from '@/generated/prisma/enums';

export type BankContribution = {
	amount: number;
	currency: Currency;
	referenceId: string;
	rawContent: string;
};

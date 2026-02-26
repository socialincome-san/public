import type { Currency } from '@/lib/types/currency';

export type BankContribution = {
	amount: number;
	currency: Currency;
	referenceId: string;
	rawContent: string;
};

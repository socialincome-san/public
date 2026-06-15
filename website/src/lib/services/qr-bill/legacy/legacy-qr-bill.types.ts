import { type Currency } from '@/generated/prisma/enums';
import { type BankContributorData } from '../../contributor/contributor.types';

export type LegacyQrBillPayment = {
	amount: number;
	currency: Currency;
	referenceId: string;
	interval: number;
};

export type LegacyQrBillReferenceData = Pick<BankContributorData, 'email' | 'firstName' | 'lastName' | 'language'>;

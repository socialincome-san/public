import { Currency } from '@/generated/prisma/enums';
import { BankContributorData } from '../contributor/contributor.types';

export type BankTransferPayment = {
	amount: number;
	currency: Currency;
	referenceId: string;
	interval: number;
};

export type BankTransferQrReferenceData = Pick<
	BankContributorData,
	'email' | 'firstName' | 'lastName' | 'language'
>;

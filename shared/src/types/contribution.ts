import { DocumentReference } from 'firebase-admin/firestore';
import { Currency } from './currency';
import { Timestamp } from './timestamp';

export const CONTRIBUTION_FIRESTORE_PATH = 'contributions';

// defines the identifiers used in the firestore collection
export enum ContributionSourceKey {
	BENEVITY = 'benevity',
	CASH = 'cash',
	RAISENOW = 'raisenow',
	STRIPE = 'stripe',
	WIRE_TRANSFER = 'wire-transfer',
}

export enum StatusKey {
	FAILED = 'failed',
	PENDING = 'pending',
	SUCCEEDED = 'succeeded',
	UNKNOWN = 'unknown',
}

export type Contribution = StripeContribution | BankWireContribution;

type BaseContribution = {
	source: ContributionSourceKey;
	status: StatusKey;
	created: Timestamp;
	amount: number;
	amount_chf: number;
	fees_chf: number;
	currency: Currency;
	campaign_path?: DocumentReference;
};

export type StripeContribution = BaseContribution & {
	source: ContributionSourceKey.STRIPE;
	monthly_interval: number;
	reference_id: string; // stripe charge id
};

export type BankWireContribution = BaseContribution & {
	source: ContributionSourceKey.WIRE_TRANSFER;
	raw_content: string;
	reference_id: number; // reference number from the bank wire
};

import { Timestamp } from './timestamp';

export const CONTRIBUTION_FIRESTORE_PATH = 'contributions';

// defines the identifiers used in the firestore collection
export enum ContributionSourceKey {
	BENEVITY = 'benevity',
	CASH = 'cash',
	STRIPE = 'stripe',
	WIRE_TRANSFER = 'wire-transfer',
}

export enum StatusKey {
	FAILED = 'failed',
	PENDING = 'pending',
	SUCCEEDED = 'succeeded',
	UNKNOWN = 'unknown',
}

export type Contribution = {
	source: ContributionSourceKey;
	status: StatusKey;
	created: Timestamp;
	amount: number;
	amount_chf: number;
	fees_chf: number;
	currency: string;
};

export type StripeContribution = Contribution & {
	source: ContributionSourceKey.STRIPE;
	monthly_interval: number;
	reference_id: string; // stripe charge id
};

export type BankWireContribution = Contribution & {
	source: ContributionSourceKey.WIRE_TRANSFER;
	rawContent: string;
	referenceId: number; // reference number from the bank wire
};

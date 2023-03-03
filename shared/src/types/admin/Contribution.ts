import { Timestamp } from '@google-cloud/firestore';

export const CONTRIBUTION_FIRESTORE_PATH = 'contributions';

// defines the identifiers used in the firestore collection
export enum ContributionSourceKey {
	BENEVITY = 'benevity',
	CASH = 'cash',
	TWINT = 'twint',
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
	created: Timestamp | Date; // TODO: use Timestamp only
	amount: number;
	currency: string;
	amount_chf: number;
	fees_chf: number;
	reference_id: string; // e.g stripe charge id
	monthly_interval: number;
	status: StatusKey;
};

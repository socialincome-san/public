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
}

export type Contribution = {
	source: ContributionSourceKey;
	created: Date | Timestamp; // This is a hack. Firestore returns a Timestamp, but Firecms seems to expect a Date for a date picker. Will look into this.
	amount: number;
	currency: string;
	amount_chf: number;
	fees_chf: number | undefined;
	reference_id: string; // e.g stripe charge id
	monthly_interval: number | undefined;
	status: StatusKey | undefined;
};

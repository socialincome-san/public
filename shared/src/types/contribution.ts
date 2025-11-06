import { DocumentReference } from 'firebase-admin/firestore';
import { Campaign } from './campaign';
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

/**
 * Represents a contribution to Social Income. The amount that ends up on our account is amount_chf - fees_chf.
 */
type BaseContribution = {
	source: ContributionSourceKey;
	status: StatusKey;
	created: Timestamp;
	last_updated_at: Timestamp;
	amount: number;
	amount_chf: number; // Amount donated in CHF, including fees
	fees_chf: number; // Transaction fees in CHF
	currency: Currency;
	campaign_path?: DocumentReference<Campaign>;
};

export type StripeContribution = BaseContribution & {
	source: ContributionSourceKey.STRIPE;
	monthly_interval: number;
	reference_id: string; // The stripe charge id, see: https://docs.stripe.com/api/charges
};

export type BankWireContribution = BaseContribution & {
	source: ContributionSourceKey.WIRE_TRANSFER;
	transaction_id: string;
	reference_id: string; // wire transfer reference id, see below
	monthly_interval: number;
	raw_content: string;
	/**
	 * the reference_id is a 27-digit number that is constructed as follows:
	 * trailing zeros (7 digits)
	 * the user's payment_reference_id (13 digits) – to keep it simple, we assign the unix timestamp in milliseconds when the user is created
	 * 4 zeroes – could be used to encode more information in the future (4 digits)
	 * selected payment interval in months (2 digits)
	 * modulo 10 recursive as check digit (1 digit) – required by qr bill standard
	 */
};

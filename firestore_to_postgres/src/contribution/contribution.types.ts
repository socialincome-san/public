import { ContributionStatus, PaymentEventType, Prisma } from '@prisma/client';
import { Contribution as FirestoreContribution } from '@socialincome/shared/src/types/contribution';
import { User } from '@socialincome/shared/src/types/user';

export const CONTRIBUTION_FIRESTORE_PATH = 'contributions';
export const USER_FIRESTORE_PATH = 'users';

export type FirestoreUserWithId = User & { id: string };

export type FirestoreContributionWithId = FirestoreContribution & { id: string };

export type FirestoreContributionWithUser = {
	contribution: FirestoreContributionWithId;
	user: FirestoreUserWithId;
};

export type PaymentEventCreateInput = {
	type: PaymentEventType;
	transactionId: string | null;
	metadata?: Prisma.InputJsonValue | Prisma.JsonNullValueInput;
};

export type TransformedContribution = {
	contributorEmail: string;
	campaignTitle: string | null;
	amount: number;
	amountChf: number;
	feesChf: number;
	currency: string;
	status: ContributionStatus;
	paymentEvent: PaymentEventCreateInput;
};

export type ContributionCreateInput = Prisma.ContributionCreateInput;

export type ContributionWithPayment = {
	contribution: ContributionCreateInput;
	paymentEvent?: PaymentEventCreateInput;
};

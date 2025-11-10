import { ContributionStatus, OrganizationPermission, PaymentEventType, Prisma } from '@prisma/client';

export type ContributionTableViewRow = {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	amount: number;
	currency: string;
	campaignTitle: string;
	programName: string | null;
	createdAt: Date;
};

export type ContributionTableView = {
	tableRows: ContributionTableViewRow[];
	permission: OrganizationPermission;
};

export type ContributionUpdateInput = Prisma.ContributionUpdateInput;
export type ContributionCreateInput = Prisma.ContributionCreateInput;

export type ContributionPayload = {
	id: string;
	amount: number;
	currency: string;
	amountChf: number;
	feesChf: number;
	status: ContributionStatus;
	contributor: {
		id: string;
	};
	campaign: {
		id: string;
	};
};

export type ContributionWithRelations = Prisma.ContributionGetPayload<{
	include: { contributor: true; campaign: true };
}>;

export type StripeContributionCreateData = {
	contributorId: string;
	amount: number;
	currency: string;
	amountChf: number;
	feesChf: number;
	status: ContributionStatus;
	referenceId: string;
	campaignId: string;
	createdAt: Date;
};

export type PaymentEventCreateData = {
	type: PaymentEventType;
	transactionId?: string;
	metadata?: Record<string, unknown>;
};

import type { Prisma } from '@/generated/prisma/client';
import { Currency } from '@/generated/prisma/enums';
import type { AuditContext } from '@/lib/audit/audit-types';
import { auditedWrite, defineAuditedEntity } from '@/lib/audit/audited-write';

// Every write here stores a campaign audit event in the same transaction.
// Pending claims belong to the campaign. Reads live in
// campaign.repository.read.ts.

export const createCampaign = async (
	audit: AuditContext,
	data: {
		goal: number | null;
		currency: Currency;
		endDate: Date;
		slug: string;
		programId: string;
		contributorId?: string | null;
	},
): Promise<{ kind: 'created'; id: string; slug: string } | { kind: 'slug-exists' }> => {
	try {
		const campaign = await auditedWrite({ entity: campaignEntity, context: audit, action: 'create' }, (transaction) =>
			transaction.campaign.create({
				data: {
					goal: data.goal,
					currency: data.currency,
					endDate: data.endDate,
					slug: data.slug,
					program: { connect: { id: data.programId } },
					...(data.contributorId ? { contributor: { connect: { id: data.contributorId } } } : {}),
				},
				select: { id: true, slug: true },
			}),
		);

		return { kind: 'created', id: campaign.id, slug: campaign.slug ?? data.slug };
	} catch (error) {
		if (isUniqueConstraintError(error)) {
			return { kind: 'slug-exists' };
		}

		throw error;
	}
};

export const createDefaultCampaign = async (audit: AuditContext, programId: string, endDate: Date) =>
	auditedWrite({ entity: campaignEntity, context: audit, action: 'create' }, (transaction) =>
		transaction.campaign.create({
			data: {
				currency: Currency.CHF,
				endDate,
				isDefault: true,
				program: { connect: { id: programId } },
			},
			select: { id: true },
		}),
	);

export const createCampaignPending = async (
	audit: AuditContext,
	campaignId: string,
	claimId: string,
): Promise<{ kind: 'created' } | { kind: 'claim-id-exists' }> => {
	try {
		await auditedWrite({ entity: campaignEntity, context: audit, action: 'update', entityId: campaignId }, (transaction) =>
			transaction.campaignPending.create({ data: { claimId, campaignId } }),
		);

		return { kind: 'created' };
	} catch (error) {
		if (isUniqueConstraintError(error)) {
			return { kind: 'claim-id-exists' };
		}

		throw error;
	}
};

export const updateCampaignContributorForClaim = async (
	audit: AuditContext,
	campaignId: string,
	claimId: string,
	contributorId: string,
) =>
	auditedWrite({ entity: campaignEntity, context: audit, action: 'update', entityId: campaignId }, async (transaction) => {
		await transaction.campaign.update({
			where: { id: campaignId },
			data: { contributor: { connect: { id: contributorId } } },
		});
		await transaction.campaignPending.delete({ where: { claimId } });
	});

export const deleteCampaignPending = async (audit: AuditContext, campaignId: string, claimId: string) =>
	auditedWrite({ entity: campaignEntity, context: audit, action: 'update', entityId: campaignId }, (transaction) =>
		transaction.campaignPending.delete({ where: { claimId } }),
	);

export const deleteCampaigns = async (audit: AuditContext, campaignIds: string[]) =>
	auditedWrite({ entity: campaignEntity, context: audit, action: 'delete', entityId: campaignIds }, (transaction) =>
		transaction.campaign.deleteMany({ where: { id: { in: campaignIds } } }),
	);

const campaignAuditSnapshotSelect = {
	legacyFirestoreId: true,
	goal: true,
	currency: true,
	additionalAmountChf: true,
	endDate: true,
	isDefault: true,
	isFallback: true,
	slug: true,
	programId: true,
	contributorId: true,
	campaignPendings: { select: { claimId: true }, orderBy: { claimId: 'asc' } },
} satisfies Prisma.CampaignSelect;

const campaignEntity = defineAuditedEntity({
	type: 'campaign',
	findSnapshot: (transaction, campaignId) =>
		transaction.campaign.findUnique({ where: { id: campaignId }, select: campaignAuditSnapshotSelect }),
	getName: ({ slug }) => slug,
});

const isUniqueConstraintError = (error: unknown): boolean => {
	if (typeof error !== 'object' || error === null || !('code' in error)) {
		return false;
	}

	return error.code === 'P2002';
};

/**
 * Stores the current state of every audited entity that has no audit event
 * yet, so the audit log shows a diff for its first change. Safe to rerun.
 * Dry-run by default (exit 1 if anything would be stored). Pass `--apply` to write.
 *
 * Usage (from website/):
 *   DATABASE_URL=... npm run db:backfill:audit-baselines
 *   DATABASE_URL=... npm run db:backfill:audit-baselines -- --apply --concurrency=5
 */

import type { Prisma } from '@/generated/prisma/client';
import type { AuditContext } from '@/lib/audit/audit-types';
import { recordAuditBaseline, type AuditedEntity } from '@/lib/audit/audited-write';
import { prisma } from '@/lib/database/prisma';
import { campaignEntity } from '@/modules/campaigns/campaign.repository.write';
import { contributionEntity } from '@/modules/contributions/contribution.repository.write';
import { contributorEntity } from '@/modules/contributors/contributor.repository.write';
import { countryEntity } from '@/modules/countries/country.repository.write';
import { donationCertificateEntity } from '@/modules/donation-certificates/donation-certificate.repository.write';
import { expenseEntity } from '@/modules/expenses/expense.repository.write';
import { focusEntity } from '@/modules/focuses/focus.repository.write';
import { localPartnerEntity } from '@/modules/local-partners/local-partner.repository.write';
import { mobileMoneyProviderEntity } from '@/modules/mobile-money-providers/mobile-money-provider.repository.write';
import { organizationEntity } from '@/modules/organizations/organization.repository.write';
import { payoutEntity } from '@/modules/payouts/payout.repository.write';
import { programEntity } from '@/modules/programs/program.repository.write';
import { recipientEntity } from '@/modules/recipients/recipient.repository.write';
import { subscriptionEntity } from '@/modules/subscriptions/subscription.repository.write';
import { surveyEntity } from '@/modules/surveys/survey.repository.write';
import { userEntity } from '@/modules/users/user.repository.write';
import {
	assertDatabaseUrl,
	exitCodeForCreateOnlyScript,
	getDatabaseHost,
	log,
	mapWithConcurrency,
	parseBackfillCliOptions,
	printSummary,
} from '../shared/backfill-shared';

const context: AuditContext = { actor: { type: 'system', id: 'audit-baseline' }, source: 'system' };

const auditedType = <Snapshot extends Prisma.InputJsonObject>(
	entity: AuditedEntity<Snapshot>,
	findIds: () => Promise<{ id: string }[]>,
) => ({ type: entity.type, findIds, record: (id: string) => recordAuditBaseline(entity, context, id) });

const select = { id: true } as const;

const auditedTypes = [
	auditedType(recipientEntity, () => prisma.recipient.findMany({ select })),
	auditedType(payoutEntity, () => prisma.payout.findMany({ select })),
	auditedType(contributorEntity, () => prisma.contributor.findMany({ select })),
	auditedType(contributionEntity, () => prisma.contribution.findMany({ select })),
	auditedType(subscriptionEntity, () => prisma.subscription.findMany({ select })),
	auditedType(donationCertificateEntity, () => prisma.donationCertificate.findMany({ select })),
	auditedType(localPartnerEntity, () => prisma.localPartner.findMany({ select })),
	auditedType(campaignEntity, () => prisma.campaign.findMany({ select })),
	auditedType(surveyEntity, () => prisma.survey.findMany({ select })),
	auditedType(expenseEntity, () => prisma.expense.findMany({ select })),
	auditedType(countryEntity, () => prisma.country.findMany({ select })),
	auditedType(focusEntity, () => prisma.focus.findMany({ select })),
	auditedType(mobileMoneyProviderEntity, () => prisma.mobileMoneyProvider.findMany({ select })),
	auditedType(programEntity, () => prisma.program.findMany({ select })),
	auditedType(userEntity, () => prisma.user.findMany({ select })),
	auditedType(organizationEntity, () => prisma.organization.findMany({ select })),
];

const main = async () => {
	assertDatabaseUrl();
	const { apply, concurrency } = parseBackfillCliOptions(process.argv.slice(2));
	log(`Database: ${getDatabaseHost(process.env.DATABASE_URL ?? '')}`);
	log(`Mode: ${apply ? 'APPLY' : 'dry-run'}, concurrency=${concurrency}`);
	log('');

	const summary = { baselinesToStore: 0, baselinesStored: 0, errors: 0 };
	for (const { type, findIds, record } of auditedTypes) {
		const [rows, audited] = await Promise.all([
			findIds(),
			prisma.auditEvent.findMany({ where: { entityType: type }, distinct: ['entityId'], select: { entityId: true } }),
		]);
		const auditedIds = new Set(audited.map(({ entityId }) => entityId));
		const missingIds = rows.map(({ id }) => id).filter((id) => !auditedIds.has(id));
		summary.baselinesToStore += missingIds.length;
		log(`${type}: ${rows.length} entities, ${missingIds.length} without audit events`);
		if (!apply) {
			continue;
		}

		await mapWithConcurrency(missingIds, concurrency, async (id) => {
			try {
				if (await record(id)) {
					summary.baselinesStored += 1;
				}
			} catch (error) {
				summary.errors += 1;
				log(`error storing ${type} ${id}: ${error instanceof Error ? error.message : String(error)}`);
			}
		});
	}

	printSummary(summary);
	process.exitCode = exitCodeForCreateOnlyScript(
		{ errors: summary.errors, recordsToCreate: summary.baselinesToStore },
		apply,
	);
};

main()
	.catch((error) => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

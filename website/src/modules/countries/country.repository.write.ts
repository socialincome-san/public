import type { Prisma } from '@/generated/prisma/client';
import type { AuditContext } from '@/lib/audit/audit-types';
import { auditedWrite, defineAuditedEntity } from '@/lib/audit/audited-write';
import { countryPayloadSelect } from './country.repository.read';
import type { CountryCreateInput, CountryUpdateInput } from './country.schemas';

// Every write here stores a country audit event in the same transaction.
// Reads live in country.repository.read.ts.

export const createCountry = async (audit: AuditContext, input: CountryCreateInput) =>
	auditedWrite({ entity: countryEntity, context: audit, action: 'create' }, (transaction) =>
		transaction.country.create({
			data: {
				isoCode: input.isoCode,
				isActive: input.isActive,
				currency: input.currency,
				defaultPayoutAmount: input.defaultPayoutAmount,
				microfinanceIndex: input.microfinanceIndex ?? undefined,
				cashConditionOverride: input.cashConditionOverride,
				populationCoverage: input.populationCoverage ?? undefined,
				latestSurveyDate: input.latestSurveyDate ?? undefined,
				networkTechnology: input.networkTechnology ?? undefined,
				mobileMoneyProviders: input.mobileMoneyProviderIds.length
					? {
							createMany: {
								data: input.mobileMoneyProviderIds.map((mobileMoneyProviderId) => ({
									mobileMoneyProviderId,
								})),
								skipDuplicates: true,
							},
						}
					: undefined,
				mobileMoneyConditionOverride: input.mobileMoneyConditionOverride,
				sanctions: input.sanctions,
				microfinanceSourceLink: input.microfinanceSourceLink
					? {
							create: input.microfinanceSourceLink,
						}
					: undefined,
				networkSourceLink: input.networkSourceLink
					? {
							create: input.networkSourceLink,
						}
					: undefined,
			},
			select: countryPayloadSelect,
		}),
	);

export const updateCountry = async (audit: AuditContext, input: CountryUpdateInput) =>
	auditedWrite({ entity: countryEntity, context: audit, action: 'update', entityId: input.id }, (transaction) =>
		transaction.country.update({
			where: { id: input.id },
			data: {
				isoCode: input.isoCode,
				isActive: input.isActive,
				currency: input.currency,
				defaultPayoutAmount: input.defaultPayoutAmount,
				microfinanceIndex: input.microfinanceIndex,
				cashConditionOverride: input.cashConditionOverride,
				populationCoverage: input.populationCoverage,
				latestSurveyDate: input.latestSurveyDate,
				networkTechnology: input.networkTechnology ?? undefined,
				mobileMoneyProviders: {
					deleteMany: {},
					createMany: {
						data: input.mobileMoneyProviderIds.map((mobileMoneyProviderId) => ({
							mobileMoneyProviderId,
						})),
						skipDuplicates: true,
					},
				},
				mobileMoneyConditionOverride: input.mobileMoneyConditionOverride,
				sanctions: input.sanctions,
				microfinanceSourceLink: input.microfinanceSourceLink
					? {
							upsert: {
								create: input.microfinanceSourceLink,
								update: input.microfinanceSourceLink,
							},
						}
					: { disconnect: true },
				networkSourceLink: input.networkSourceLink
					? {
							upsert: {
								create: input.networkSourceLink,
								update: input.networkSourceLink,
							},
						}
					: { disconnect: true },
			},
			select: countryPayloadSelect,
		}),
	);

export const deleteCountry = async (audit: AuditContext, countryId: string) =>
	auditedWrite({ entity: countryEntity, context: audit, action: 'delete', entityId: countryId }, (transaction) =>
		transaction.country.delete({
			where: { id: countryId },
			select: { id: true },
		}),
	);

// Source links and mobile money provider mappings belong to the country.
const countryAuditSnapshotSelect = {
	isoCode: true,
	isActive: true,
	currency: true,
	defaultPayoutAmount: true,
	cashConditionOverride: true,
	microfinanceIndex: true,
	latestSurveyDate: true,
	microfinanceSourceLink: { select: { href: true, text: true } },
	mobileMoneyConditionOverride: true,
	mobileMoneyProviders: { select: { mobileMoneyProviderId: true }, orderBy: { mobileMoneyProviderId: 'asc' } },
	populationCoverage: true,
	networkTechnology: true,
	networkSourceLink: { select: { href: true, text: true } },
	sanctions: true,
} satisfies Prisma.CountrySelect;

const countryEntity = defineAuditedEntity({
	type: 'country',
	findSnapshot: (transaction, countryId) =>
		transaction.country.findUnique({ where: { id: countryId }, select: countryAuditSnapshotSelect }),
	getName: ({ isoCode }) => isoCode,
});

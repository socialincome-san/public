import type { Prisma } from '@/generated/prisma/client';
import type { CountryCode } from '@/generated/prisma/enums';
import type { AuditContext } from '@/lib/audit/audit-types';
import { auditedWrite, defineAuditedEntity } from '@/lib/audit/audited-write';

// Every write here stores an organization audit event in the same
// transaction. Program accesses belong to programs and memberships to
// users, so they are written through those modules. Reads live in
// organization.repository.read.ts.

export const createOrganization = async (
	audit: AuditContext,
	name: string,
	operatorFallbackCountryCode: CountryCode | null,
) =>
	auditedWrite({ entity: organizationEntity, context: audit, action: 'create' }, (transaction) =>
		transaction.organization.create({
			data: { name, operatorFallbackCountryCode },
			select: { id: true, name: true },
		}),
	);

export const updateOrganizationName = async (audit: AuditContext, organizationId: string, name: string) =>
	auditedWrite({ entity: organizationEntity, context: audit, action: 'update', entityId: organizationId }, (transaction) =>
		transaction.organization.update({
			where: { id: organizationId },
			data: { name },
			select: { id: true, name: true },
		}),
	);

export const updateOrganization = async (
	audit: AuditContext,
	organizationId: string,
	name: string,
	operatorFallbackCountryCode: CountryCode | null,
) =>
	auditedWrite({ entity: organizationEntity, context: audit, action: 'update', entityId: organizationId }, (transaction) =>
		transaction.organization.update({
			where: { id: organizationId },
			data: { name, operatorFallbackCountryCode },
			select: { id: true, name: true },
		}),
	);

export const deleteOrganization = async (audit: AuditContext, organizationId: string) =>
	auditedWrite({ entity: organizationEntity, context: audit, action: 'delete', entityId: organizationId }, (transaction) =>
		transaction.organization.delete({ where: { id: organizationId } }),
	);

const organizationAuditSnapshotSelect = {
	name: true,
	operatorFallbackCountryCode: true,
} satisfies Prisma.OrganizationSelect;

const organizationEntity = defineAuditedEntity({
	type: 'organization',
	findSnapshot: (transaction, organizationId) =>
		transaction.organization.findUnique({ where: { id: organizationId }, select: organizationAuditSnapshotSelect }),
	getName: ({ name }) => name,
});

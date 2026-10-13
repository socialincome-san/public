import type { Prisma } from '@/generated/prisma/client';
import type { AuditContext } from '@/lib/audit/audit-types';
import { auditedWrite, type AuditedEntity } from '@/lib/audit/audited-write';
import { mobileMoneyProviderPayloadSelect } from './mobile-money-provider.repository.read';
import type { MobileMoneyProviderCreateInput, MobileMoneyProviderUpdateInput } from './mobile-money-provider.schemas';

// Every write here stores a mobile money provider audit event in the same
// transaction. Reads live in mobile-money-provider.repository.read.ts.

export const createMobileMoneyProvider = async (audit: AuditContext, input: MobileMoneyProviderCreateInput) =>
	auditedWrite({ entity: mobileMoneyProviderEntity, context: audit, action: 'create' }, (transaction) =>
		transaction.mobileMoneyProvider.create({
			data: {
				name: input.name,
				payoutProcess: input.payoutProcess ?? null,
				parentId: input.parentId ?? null,
			},
			select: mobileMoneyProviderPayloadSelect,
		}),
	);

export const updateMobileMoneyProvider = async (audit: AuditContext, input: MobileMoneyProviderUpdateInput) =>
	auditedWrite({ entity: mobileMoneyProviderEntity, context: audit, action: 'update', entityId: input.id }, (transaction) =>
		transaction.mobileMoneyProvider.update({
			where: { id: input.id },
			data: {
				name: input.name,
				payoutProcess: input.payoutProcess ?? null,
				parentId: input.parentId ?? null,
			},
			select: mobileMoneyProviderPayloadSelect,
		}),
	);

export const deleteMobileMoneyProvider = async (audit: AuditContext, providerId: string) =>
	auditedWrite(
		{ entity: mobileMoneyProviderEntity, context: audit, action: 'delete', entityId: providerId },
		(transaction) =>
			transaction.mobileMoneyProvider.delete({
				where: { id: providerId },
				select: { id: true },
			}),
	);

const mobileMoneyProviderAuditSnapshotSelect = {
	name: true,
	payoutProcess: true,
	parentId: true,
} satisfies Prisma.MobileMoneyProviderSelect;

const mobileMoneyProviderEntity: AuditedEntity = {
	type: 'mobile-money-provider',
	findSnapshot: (transaction, providerId) =>
		transaction.mobileMoneyProvider.findUnique({
			where: { id: providerId },
			select: mobileMoneyProviderAuditSnapshotSelect,
		}),
};

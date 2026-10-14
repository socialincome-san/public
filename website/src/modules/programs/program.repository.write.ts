import type { Prisma } from '@/generated/prisma/client';
import { ProgramPermission } from '@/generated/prisma/enums';
import type { AuditContext } from '@/lib/audit/audit-types';
import { auditedWrite, defineAuditedEntity } from '@/lib/audit/audited-write';
import type { ProgramCreateInput, ProgramSettingsUpdateInput } from './program.schemas';

// Every write here stores a program audit event in the same transaction.
// Program accesses, target focuses and survey schedules belong to the
// program. Reads live in program.repository.read.ts.

export const createProgram = async (
	audit: AuditContext,
	input: ProgramCreateInput,
	program: { name: string; slug: string; ownerOrganizationId: string; operatorOrganizationId: string },
) =>
	auditedWrite({ entity: programEntity, context: audit, action: 'create' }, (transaction) =>
		transaction.program.create({
			data: {
				name: program.name,
				slug: program.slug,
				countryId: input.countryId,
				amountOfRecipientsForStart: input.amountOfRecipientsForStart,
				coveredByReserves: false,
				programDurationInMonths: input.programDurationInMonths,
				payoutPerInterval: input.payoutPerInterval,
				payoutInterval: input.payoutInterval,
				targetFocuses: {
					create: input.targetFocuses.map((focusId) => ({ focusId })),
				},
				targetProfiles: input.targetProfiles,
				programAccesses: {
					create: [
						{ organizationId: program.ownerOrganizationId, permission: ProgramPermission.owner },
						{ organizationId: program.operatorOrganizationId, permission: ProgramPermission.operator },
					],
				},
			},
			select: { id: true },
		}),
	);

export const updateProgramSettings = async (audit: AuditContext, input: ProgramSettingsUpdateInput, slug: string) =>
	auditedWrite({ entity: programEntity, context: audit, action: 'update', entityId: input.id }, async (transaction) => {
		await transaction.program.update({
			where: { id: input.id },
			data: {
				name: input.name,
				slug,
				countryId: input.countryId,
				coveredByReserves: input.coveredByReserves,
				programDurationInMonths: input.programDurationInMonths,
				payoutPerInterval: input.payoutPerInterval,
				payoutInterval: input.payoutInterval,
				targetFocuses: {
					deleteMany: {},
					create: input.targetFocuses.map((focusId) => ({ focusId })),
				},
				targetProfiles: input.targetProfiles,
			},
		});
		await transaction.programAccess.deleteMany({
			where: {
				programId: input.id,
				permission: { in: [ProgramPermission.owner, ProgramPermission.operator] },
			},
		});
		const programAccesses = [
			...[...new Set(input.ownerOrganizationIds)].map((organizationId) => ({
				organizationId,
				permission: ProgramPermission.owner,
			})),
			...[...new Set(input.operatorOrganizationIds)].map((organizationId) => ({
				organizationId,
				permission: ProgramPermission.operator,
			})),
		].map((access) => ({ ...access, programId: input.id }));
		if (programAccesses.length > 0) {
			await transaction.programAccess.createMany({ data: programAccesses });
		}
	});

/**
 * Replaces which programs an organization owns and operates. Stores an event
 * for every previously and newly accessed program whose state changed.
 */
export const updateOrganizationProgramAccesses = async (
	audit: AuditContext,
	input: { organizationId: string; ownedProgramIds: string[]; operatedProgramIds: string[] },
) =>
	auditedWrite({ entity: programEntity, context: audit, action: 'update' }, async (transaction) => {
		const previousAccesses = await transaction.programAccess.findMany({
			where: { organizationId: input.organizationId },
			select: { programId: true },
		});
		const programIds = [
			...new Set([
				...previousAccesses.map(({ programId }) => programId),
				...input.ownedProgramIds,
				...input.operatedProgramIds,
			]),
		];

		await transaction.programAccess.deleteMany({ where: { organizationId: input.organizationId } });
		const programAccesses = [
			...[...new Set(input.ownedProgramIds)].map((programId) => ({ programId, permission: ProgramPermission.owner })),
			...[...new Set(input.operatedProgramIds)].map((programId) => ({
				programId,
				permission: ProgramPermission.operator,
			})),
		].map((access) => ({ ...access, organizationId: input.organizationId }));
		if (programAccesses.length > 0) {
			await transaction.programAccess.createMany({ data: programAccesses });
		}

		return programIds.map((id) => ({ id }));
	});

export const deleteProgram = async (audit: AuditContext, programId: string) =>
	auditedWrite({ entity: programEntity, context: audit, action: 'delete', entityId: programId }, async (transaction) => {
		await transaction.surveySchedule.deleteMany({ where: { programId } });
		await transaction.programAccess.deleteMany({ where: { programId } });
		await transaction.program.delete({ where: { id: programId } });
	});

const programAuditSnapshotSelect = {
	name: true,
	slug: true,
	amountOfRecipientsForStart: true,
	coveredByReserves: true,
	programDurationInMonths: true,
	payoutPerInterval: true,
	payoutInterval: true,
	targetProfiles: true,
	countryId: true,
	targetFocuses: { select: { focusId: true }, orderBy: { focusId: 'asc' } },
	programAccesses: {
		select: { organizationId: true, permission: true },
		orderBy: [{ permission: 'asc' }, { organizationId: 'asc' }],
	},
	surveySchedules: {
		select: { name: true, questionnaire: true, dueInMonthsAfterStart: true },
		orderBy: [{ dueInMonthsAfterStart: 'asc' }, { name: 'asc' }],
	},
} satisfies Prisma.ProgramSelect;

export const programEntity = defineAuditedEntity({
	type: 'program',
	findSnapshot: (transaction, programId) =>
		transaction.program.findUnique({ where: { id: programId }, select: programAuditSnapshotSelect }),
	getName: ({ name }) => name,
});

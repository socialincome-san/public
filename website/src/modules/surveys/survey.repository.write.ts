import { Prisma } from '@/generated/prisma/client';
import type { AuditContext } from '@/lib/audit/audit-types';
import { auditedWrite, defineAuditedEntity } from '@/lib/audit/audited-write';
import type { SurveyCreateData, SurveyResponseUpdateInput, SurveyUpdateData } from './survey.types';

// Every write here stores a survey audit event in the same transaction.
// Reads live in survey.repository.read.ts.

const recipientNotActive = new Error('Recipient is not active.');

export const createSurvey = async (audit: AuditContext, input: SurveyCreateData) =>
	auditedWrite({ entity: surveyEntity, context: audit, action: 'create' }, (transaction) =>
		transaction.survey.create({ data: input, select: surveyRecordSelect }),
	);

export const createSurveyIfRecipientActive = async (audit: AuditContext, input: SurveyCreateData) => {
	try {
		return await auditedWrite(
			{ entity: surveyEntity, context: audit, action: 'create' },
			async (transaction) => {
				const recipient = await transaction.recipient.findUnique({
					where: { id: input.recipientId },
					select: { interruptedAt: true },
				});
				if (recipient?.interruptedAt !== null) {
					throw recipientNotActive;
				}

				return transaction.survey.create({ data: input, select: surveyRecordSelect });
			},
			{ isolationLevel: 'Serializable' },
		);
	} catch (error) {
		if (error === recipientNotActive) {
			return null;
		}

		throw error;
	}
};

export const updateSurvey = async (
	audit: AuditContext,
	surveyId: string,
	input: SurveyUpdateData | SurveyResponseUpdateInput,
) =>
	auditedWrite({ entity: surveyEntity, context: audit, action: 'update', entityId: surveyId }, (transaction) =>
		transaction.survey.update({ where: { id: surveyId }, data: input, select: surveyRecordSelect }),
	);

export const deleteSurvey = async (audit: AuditContext, surveyId: string) => {
	try {
		return await auditedWrite(
			{ entity: surveyEntity, context: audit, action: 'delete', entityId: surveyId },
			(transaction) => transaction.survey.delete({ where: { id: surveyId }, select: surveyRecordSelect }),
		);
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
			return null;
		}

		throw error;
	}
};

export const removeSurveySchedules = async (audit: AuditContext, surveyIds: string[]) =>
	auditedWrite({ entity: surveyEntity, context: audit, action: 'update', entityId: surveyIds }, (transaction) =>
		transaction.survey.updateMany({ where: { id: { in: surveyIds } }, data: { surveyScheduleId: null } }),
	);

const surveyRecordSelect = {
	id: true,
	name: true,
	questionnaire: true,
	language: true,
	dueAt: true,
	completedAt: true,
	status: true,
	data: true,
	accessEmail: true,
	accessPw: true,
	recipientId: true,
	surveyScheduleId: true,
	createdAt: true,
	updatedAt: true,
} satisfies Prisma.SurveySelect;

// The access password stays out: audit events are kept forever and shown to admins.
const surveyAuditSnapshotSelect = {
	legacyFirestoreId: true,
	name: true,
	questionnaire: true,
	language: true,
	dueAt: true,
	completedAt: true,
	status: true,
	data: true,
	accessEmail: true,
	recipientId: true,
	surveyScheduleId: true,
} satisfies Prisma.SurveySelect;

const surveyEntity = defineAuditedEntity({
	type: 'survey',
	findSnapshot: (transaction, surveyId) =>
		transaction.survey.findUnique({ where: { id: surveyId }, select: surveyAuditSnapshotSelect }),
	getName: ({ name }) => name,
});

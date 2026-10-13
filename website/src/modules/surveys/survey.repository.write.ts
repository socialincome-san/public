import type { Prisma } from '@/generated/prisma/client';
import type { AuditContext } from '@/lib/audit/audit-types';
import { auditedWrite, type AuditedEntity } from '@/lib/audit/audited-write';
import type { SurveyCreateData, SurveyResponseUpdateInput, SurveyUpdateData } from './survey.types';

// Every write here stores a survey audit event in the same transaction.
// Reads live in survey.repository.read.ts.

export const createSurvey = async (audit: AuditContext, input: SurveyCreateData) =>
	auditedWrite({ entity: surveyEntity, context: audit, action: 'create' }, (transaction) =>
		transaction.survey.create({ data: input, select: surveyRecordSelect }),
	);

export const updateSurvey = async (
	audit: AuditContext,
	surveyId: string,
	input: SurveyUpdateData | SurveyResponseUpdateInput,
) =>
	auditedWrite({ entity: surveyEntity, context: audit, action: 'update', entityId: surveyId }, (transaction) =>
		transaction.survey.update({ where: { id: surveyId }, data: input, select: surveyRecordSelect }),
	);

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
	accessPw: true,
	recipientId: true,
	surveyScheduleId: true,
} satisfies Prisma.SurveySelect;

const surveyEntity: AuditedEntity = {
	type: 'survey',
	findSnapshot: (transaction, surveyId) =>
		transaction.survey.findUnique({ where: { id: surveyId }, select: surveyAuditSnapshotSelect }),
};

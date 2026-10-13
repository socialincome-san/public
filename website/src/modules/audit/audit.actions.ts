'use server';

import { resultFail, type Result } from '@/lib/result';
import { getSessionByType } from '@/modules/auth/session.service';
import { auditSessionTypeSchema, auditTrailQuerySchema } from './audit.schemas';
import { getAuditTrail } from './audit.service';
import type { AuditTrailPage } from './audit.types';

export const getAuditTrailAction = async (
	query: unknown,
	sessionType: unknown = 'user',
): Promise<Result<AuditTrailPage>> => {
	const sessionTypeResult = auditSessionTypeSchema.safeParse(sessionType);
	if (!sessionTypeResult.success) {
		return resultFail('Invalid session type');
	}

	const sessionResult = await getSessionByType(sessionTypeResult.data);
	if (!sessionResult.success) {
		return sessionResult;
	}

	const queryResult = auditTrailQuerySchema.safeParse(query);
	if (!queryResult.success) {
		return resultFail('Invalid audit trail query.');
	}

	return getAuditTrail(sessionResult.data, queryResult.data);
};

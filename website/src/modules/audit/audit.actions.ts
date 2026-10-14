'use server';

import { resultFail, type Result } from '@/lib/result';
import { getSessionByType } from '@/modules/auth/session.service';
import { entityAuditTableQuerySchema } from './audit.schemas';
import { getEntityAuditTableView } from './audit.service';
import type { AuditTableView } from './audit.types';

export const getEntityAuditTableViewAction = async (query: unknown): Promise<Result<AuditTableView>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const queryResult = entityAuditTableQuerySchema.safeParse(query);
	if (!queryResult.success) {
		return resultFail('Invalid table query.');
	}

	return getEntityAuditTableView(sessionResult.data, queryResult.data);
};

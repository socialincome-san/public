const mockAuditedWrite = jest.fn();
const mockPrismaClientKnownRequestError = class extends Error {
	constructor(
		message: string,
		readonly code: string,
	) {
		super(message);
	}
};

jest.mock('@/lib/audit/audited-write', () => ({
	auditedWrite: mockAuditedWrite,
	defineAuditedEntity: (entity: unknown) => entity,
}));
jest.mock('@/generated/prisma/client', () => ({
	Prisma: { PrismaClientKnownRequestError: mockPrismaClientKnownRequestError },
}));

import type { AuditContext } from '@/lib/audit/audit-types';
import { deleteSurvey } from './survey.repository.write';

const audit: AuditContext = {
	actor: { type: 'user', id: 'user-1' },
	source: 'portal',
};

describe('deleteSurvey', () => {
	test('treats a survey deleted by a concurrent cleanup as already removed', async () => {
		mockAuditedWrite.mockRejectedValue(new mockPrismaClientKnownRequestError('Record to delete does not exist.', 'P2025'));

		await expect(deleteSurvey(audit, 'survey-1')).resolves.toBeNull();
	});

	test('propagates other delete failures', async () => {
		const error = new mockPrismaClientKnownRequestError('Unique constraint failed.', 'P2002');
		mockAuditedWrite.mockRejectedValue(error);

		await expect(deleteSurvey(audit, 'survey-1')).rejects.toBe(error);
	});
});

import { Recipient as PrismaRecipient, RecipientStatus } from '@prisma/client';
import { usersData } from './users';
import { PROGRAM1_ID, PROGRAM2_ID } from './programs';
import { LOCAL_PARTNER1_ID } from './local-partners';
import { ORG1_ID } from './organizations';

const RECIPIENT_COUNT = 100;

const makeRecipient = (
	i: number,
	userId: string,
	orgId: string,
	programId: string,
	localPartnerId: string
): PrismaRecipient => {
	const now = new Date();
	let startDate: Date;

	switch (i % 4) {
		case 0:
			startDate = new Date(Date.UTC(now.getUTCFullYear() - 1, now.getUTCMonth(), 1));
			break;
		case 1:
			startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
			break;
		case 2:
			startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
			break;
		default:
			startDate = new Date(Date.UTC(now.getUTCFullYear() + 1, now.getUTCMonth(), 1));
			break;
	}

	return {
		id: `recipient-${i}`,
		userId,
		programId,
		status: Object.values(RecipientStatus)[(i - 1) % Object.values(RecipientStatus).length],
		createdAt: new Date(),
		updatedAt: null,
		organizationId: orgId,
		localPartnerId,
		startDate,
	};
};

export const recipientsData: PrismaRecipient[] = [];
for (let i = 1; i <= RECIPIENT_COUNT; i++) {
	const userId = usersData[i - 1].id;
	const programId = i % 2 === 0 ? PROGRAM2_ID : PROGRAM1_ID;
	recipientsData.push(makeRecipient(i, userId, ORG1_ID, programId, LOCAL_PARTNER1_ID));
}
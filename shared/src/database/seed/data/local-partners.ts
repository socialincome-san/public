import { LocalPartner as PrismaLocalPartner } from '@prisma/client';
import { usersData } from './users';

const LOCAL_PARTNER_COUNT = 5;

const makeLocalPartner = (i: number, userId: string): PrismaLocalPartner => ({
	id: `local-partner-${i}`,
	name: `Local Partner ${i}`,
	userId,
	createdAt: new Date(),
	updatedAt: null,
});

export const localPartnersData: PrismaLocalPartner[] = [];
for (let i = 1; i <= LOCAL_PARTNER_COUNT; i++) {
	localPartnersData.push(makeLocalPartner(i, usersData[i - 1].id));
}

export const LOCAL_PARTNER1_ID = localPartnersData[0].id;
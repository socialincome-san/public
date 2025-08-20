import { Organization as PrismaOrganization } from '@prisma/client';

export const ORGANIZATION_COUNT = 3;

const makeOrganization = (i: number): PrismaOrganization => ({
	id: `organization-${i}`,
	name: `Organization ${i}`,
	createdAt: new Date(),
	updatedAt: null,
});

export const organizationsData: PrismaOrganization[] = [];
for (let i = 1; i <= ORGANIZATION_COUNT; i++) {
	organizationsData.push(makeOrganization(i));
}

export const ORG1_ID = organizationsData[0].id;
export const ORG2_ID = organizationsData[1].id;
export const ORG3_ID = organizationsData[2].id;
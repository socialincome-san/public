import { Contributor as PrismaContributor } from '@prisma/client';
import { usersData } from './users';

const START = 101;
const END = 115;

const makeContributor = (i: number, userId: string): PrismaContributor => ({
	id: `contributor-${i}`,
	userId,
	createdAt: new Date(),
	updatedAt: null,
});

export const contributorsData: PrismaContributor[] = [];
for (let i = START; i <= END; i++) {
	const user = usersData[i - 1];
	contributorsData.push(makeContributor(i, user.id));
}
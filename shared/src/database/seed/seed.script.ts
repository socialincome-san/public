import { prisma } from '../prisma';
import { organizationData1, programData1, programData2, userData1 } from './seed.data';

async function main() {
	await prisma.organization.createMany({
		data: [organizationData1],
		skipDuplicates: true,
	});

	await prisma.user.createMany({
		data: [userData1],
		skipDuplicates: true,
	});

	await prisma.program.createMany({
		data: [programData1, programData2],
		skipDuplicates: true,
	});
}

main()
	.catch((e) => {
		console.error('❌ Seed failed', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
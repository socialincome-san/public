import { prisma } from '../prisma';
import { localPartnersData, organizationsData, programsData, recipientsData, usersData } from './seed.data';

async function main() {
	await prisma.organization.createMany({
		data: organizationsData,
		skipDuplicates: true,
	});

	await prisma.user.createMany({
		data: usersData,
		skipDuplicates: true,
	});

	await prisma.program.createMany({
		data: programsData,
		skipDuplicates: true,
	});

	await prisma.localPartner.createMany({
		data: localPartnersData,
		skipDuplicates: true,
	});

	await prisma.recipient.createMany({
		data: recipientsData,
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
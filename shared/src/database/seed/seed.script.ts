import { prisma } from '../prisma';
import {
	exchangeRateCollectionsData, exchangeRateItemsData,
	localPartnersData,
	organizationsData,
	payoutsData,
	programsData,
	recipientsData,
	usersData
} from './seed.data';

async function main() {
	await prisma.organization.createMany({ data: organizationsData, skipDuplicates: true });
	await prisma.user.createMany({ data: usersData, skipDuplicates: true });
	await prisma.program.createMany({ data: programsData, skipDuplicates: true });
	await prisma.localPartner.createMany({ data: localPartnersData, skipDuplicates: true });
	await prisma.recipient.createMany({ data: recipientsData, skipDuplicates: true });

	await prisma.payout.createMany({ data: payoutsData, skipDuplicates: true });

	await prisma.exchangeRateCollection.createMany({
		data: exchangeRateCollectionsData,
		skipDuplicates: true,
	});
	await prisma.exchangeRateItem.createMany({
		data: exchangeRateItemsData,
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
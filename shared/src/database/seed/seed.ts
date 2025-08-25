import { prisma } from '../prisma';
import { organizationsData } from './data/organizations';
import { usersData } from './data/users';
import { programsData } from './data/programs';
import { localPartnersData } from './data/local-partners';
import { recipientsData } from './data/recipients';
import { payoutsData } from './data/payouts';
import { exchangeRateCollectionsData, exchangeRateItemsData } from './data/exchange-rates';
import { contributorsData } from './data/contributors';
import { contributionsData } from './data/contributions';
import { campaignsData } from './data/campaigns';
import { surveysData } from './data/surveys';
import { expensesData } from './data/expenses';

async function main() {
	await prisma.$transaction(async (tx) => {
		await tx.organization.createMany({ data: organizationsData, skipDuplicates: true });
		await tx.user.createMany({ data: usersData, skipDuplicates: true });
		await tx.program.createMany({ data: programsData, skipDuplicates: true });
		await tx.localPartner.createMany({ data: localPartnersData, skipDuplicates: true });
		await tx.recipient.createMany({ data: recipientsData, skipDuplicates: true });

		await tx.payout.createMany({ data: payoutsData, skipDuplicates: true });

		await tx.exchangeRateCollection.createMany({
			data: exchangeRateCollectionsData,
			skipDuplicates: true,
		});

		await tx.exchangeRateItem.createMany({
			data: exchangeRateItemsData,
			skipDuplicates: true,
		});

		await tx.contributor.createMany({ data: contributorsData, skipDuplicates: true });
		await tx.contribution.createMany({ data: contributionsData, skipDuplicates: true });
		await tx.campaign.createMany({ data: campaignsData, skipDuplicates: true });
		await tx.survey.createMany({ data: surveysData, skipDuplicates: true });
		await tx.expense.createMany({ data: expensesData, skipDuplicates: true });
	});
}

main()
	.then(() => {
		console.log('✅ Seed completed (transaction committed)');
	})
	.catch((e) => {
		console.error('❌ Seed failed (transaction rolled back)', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
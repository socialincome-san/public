import { prisma } from '../prisma';
import { accountsData } from './data/accounts.data';
import { usersData } from './data/users.data';
import { phonesData } from './data/phones.data';
import { contactsData } from './data/contacts.data';
import { organizationsData } from './data/organizations.data';
import { organizationAccessesData } from './data/organization-accesses.data';
import { programsData } from './data/programs.data';
import { programAccessesData } from './data/program-accesses.data';
import { localPartnersData } from './data/local-partners.data';
import { paymentInformationsData } from './data/payment-information.data';
import { campaignsData } from './data/campaigns.data';
import { contributorsData } from './data/contributors.data';
import { contributionsData } from './data/contributions.data';
import { paymentEventsData } from './data/payment-events.data';
import { donationCertificatesData } from './data/donation-certificates.data';
import { recipientsData } from './data/recipients.data';
import { payoutsData } from './data/payouts.data';
import { surveysData } from './data/surveys.data';
import { expensesData } from './data/expenses.data';
import { exchangeRatesData } from './data/exchange-rates.data';
import { addressesData } from './data/addresses.data';
import { surveySchedulesData } from './data/survey-schedules.data';
import { countriesData } from './data/countries.data';
import { sourceLinksData } from './data/source-links.data';

async function main() {
	await prisma.$transaction(async (tx) => {
		await tx.survey.deleteMany();
		await tx.surveySchedule.deleteMany();
		await tx.payout.deleteMany();
		await tx.recipient.deleteMany();
		await tx.paymentEvent.deleteMany();
		await tx.contribution.deleteMany();
		await tx.donationCertificate.deleteMany();
		await tx.contributor.deleteMany();
		await tx.campaign.deleteMany();
		await tx.paymentInformation.deleteMany();
		await tx.localPartner.deleteMany();
		await tx.programAccess.deleteMany();
		await tx.program.deleteMany();
		await tx.organizationAccess.deleteMany();
		await tx.expense.deleteMany();
		await tx.organization.deleteMany();
		await tx.exchangeRate.deleteMany();
		await tx.user.deleteMany();
		await tx.contact.deleteMany();
		await tx.phone.deleteMany();
		await tx.address.deleteMany();
		await tx.account.deleteMany();
		await tx.sourceLink.deleteMany();
		await tx.country.deleteMany();

		await tx.sourceLink.createMany({ data: sourceLinksData, skipDuplicates: true });
		await tx.country.createMany({ data: countriesData, skipDuplicates: true });
		await tx.account.createMany({ data: accountsData, skipDuplicates: true });
		await tx.address.createMany({ data: addressesData, skipDuplicates: true });
		await tx.phone.createMany({ data: phonesData, skipDuplicates: true });
		await tx.contact.createMany({ data: contactsData, skipDuplicates: true });
		await tx.organization.createMany({ data: organizationsData, skipDuplicates: true });
		await tx.user.createMany({ data: usersData, skipDuplicates: true });
		await tx.organizationAccess.createMany({ data: organizationAccessesData, skipDuplicates: true });
		await tx.program.createMany({ data: programsData, skipDuplicates: true });
		await tx.programAccess.createMany({ data: programAccessesData, skipDuplicates: true });
		await tx.localPartner.createMany({ data: localPartnersData, skipDuplicates: true });
		await tx.paymentInformation.createMany({ data: paymentInformationsData, skipDuplicates: true });
		await tx.campaign.createMany({ data: campaignsData, skipDuplicates: true });
		await tx.contributor.createMany({ data: contributorsData, skipDuplicates: true });
		await tx.contribution.createMany({ data: contributionsData, skipDuplicates: true });
		await tx.paymentEvent.createMany({ data: paymentEventsData, skipDuplicates: true });
		await tx.donationCertificate.createMany({ data: donationCertificatesData, skipDuplicates: true });
		await tx.recipient.createMany({ data: recipientsData, skipDuplicates: true });
		await tx.payout.createMany({ data: payoutsData, skipDuplicates: true });
		await tx.surveySchedule.createMany({ data: surveySchedulesData, skipDuplicates: true });
		await tx.survey.createMany({ data: surveysData, skipDuplicates: true });
		await tx.expense.createMany({ data: expensesData, skipDuplicates: true });
		await tx.exchangeRate.createMany({ data: exchangeRatesData, skipDuplicates: true });
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
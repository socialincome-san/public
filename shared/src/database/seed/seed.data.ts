import {
	User as PrismaUser,
	Program as PrismaProgram,
	Organization as PrismaOrganization,
	Recipient as PrismaRecipient,
	LocalPartner as PrismaLocalPartner,
	Payout as PrismaPayout,
	ExchangeRateCollection as PrismaExchangeRateCollection,
	ExchangeRateItem as PrismaExchangeRateItem,
	Gender,
	UserRole,
	RecipientStatus, PayoutStatus
} from '@prisma/client';

const now = () => new Date();

const ORGANIZATION_COUNT = 3;
const USER_COUNT = 150;
const LOCAL_PARTNER_COUNT = 5;
const RECIPIENT_COUNT = 100;

const makeOrganization = (i: number): PrismaOrganization => ({
	id: `organization-${i}`,
	name: `Organization ${i}`,
	createdAt: now(),
	updatedAt: null,
});

const makeUser = (i: number, orgId?: string): PrismaUser => ({
	id: `user-${i}`,
	email: `user${i}@test.org`,
	authUserId: i === 1 ? "w43IydQbr8lgeGeevbSBoP9ui3WQ" : `auth-${i}`,
	firstName: `First${i}`,
	lastName: `Last${i}`,
	gender: i % 2 === 0 ? Gender.female : Gender.male,
	phone: null,
	company: null,
	referral: null,
	paymentReferenceId: null,
	stripeCustomerId: null,
	institution: false,
	language: null,
	currency: null,
	addressStreet: null,
	addressNumber: null,
	addressCity: null,
	addressZip: null,
	addressCountry: null,
	role: UserRole.user,
	organizationId: orgId ?? null,
	birthDate: new Date(
		1980 + (i % 30), // year cycles between 1980–2009
		i % 12,          // month cycles 0–11
		(i % 28) + 1     // day cycles 1–28
	),
	communicationPhone: null,
	mobileMoneyPhone: null,
	hasWhatsAppComm: null,
	hasWhatsAppMobile: null,
	whatsappActivated: null,
	instaHandle: null,
	twitterHandle: null,
	profession: null,
	callingName: null,
	omUid: null,
	createdAt: now(),
	updatedAt: null,
});

const makeProgram = (
	i: number,
	operatorOrgId: string,
	viewerOrgId: string
): PrismaProgram => ({
	id: `program-${i}`,
	name: `Program ${i}`,
	totalPayments: 36,
	payoutAmount: 700,
	payoutCurrency: 'SLE',
	payoutInterval: 'monthly',
	operatorOrganizationId: operatorOrgId,
	viewerOrganizationId: viewerOrgId,
	createdAt: now(),
	updatedAt: null,
});
const makeLocalPartner = (i: number, userId: string): PrismaLocalPartner => ({
	id: `local-partner-${i}`,
	name: `Local Partner ${i}`,
	userId,
	createdAt: now(),
	updatedAt: null,
});

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
			startDate = new Date(Date.UTC(now.getUTCFullYear() - 1, now.getUTCMonth(), 1)); // 1 year ago
			break;
		case 1:
			startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1)); // 1 month ago
			break;
		case 2:
			startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)); // 1 month ahead
			break;
		default:
			startDate = new Date(Date.UTC(now.getUTCFullYear() + 1, now.getUTCMonth(), 1)); // 1 year ahead
			break;
	}

	return {
		id: `recipient-${i}`,
		userId,
		programId,
		status: Object.values(RecipientStatus)[(i - 1) % Object.values(RecipientStatus).length],
		createdAt: now,
		updatedAt: null,
		organizationId: orgId,
		localPartnerId,
		startDate,
	};
};

const makePayout = (
	i: number,
	recipientId: string,
	monthsAgo: number
): PrismaPayout => {
	const date = new Date();
	date.setUTCMonth(date.getUTCMonth() - monthsAgo);

	return {
		id: `payout-${i}-${monthsAgo}`,
		recipientId,
		amount: 700,
		amountChf: null,
		currency: 'SLE',
		paymentAt: date,
		status: PayoutStatus.paid,
		phoneNumber: null,
		comments: null,
		message: null,
		createdAt: new Date(),
		updatedAt: null,
	};
};

export const exchangeRateCollectionsData: PrismaExchangeRateCollection[] = [
	{
		id: "exchange-collection-1",
		base: "CHF",
		timestamp: new Date(),
		createdAt: new Date(),
		updatedAt: null,
	},
];

export const exchangeRateItemsData: PrismaExchangeRateItem[] = [
	{
		id: "exchange-item-chf",
		currency: "CHF",
		rate: 1,
		collectionId: "exchange-collection-1",
		createdAt: new Date(),
		updatedAt: null,
	},
	{
		id: "exchange-item-usd",
		currency: "USD",
		rate: 1.12,
		collectionId: "exchange-collection-1",
		createdAt: new Date(),
		updatedAt: null,
	},
	{
		id: "exchange-item-sle",
		currency: "SLE",
		rate: 25000,
		collectionId: "exchange-collection-1",
		createdAt: new Date(),
		updatedAt: null,
	},
];

export const organizationsData: PrismaOrganization[] = [];
for (let i = 1; i <= ORGANIZATION_COUNT; i++) {
	organizationsData.push(makeOrganization(i));
}
const ORG1_ID = organizationsData[0].id;

export const usersData: PrismaUser[] = [];
for (let i = 1; i <= USER_COUNT; i++) {
	usersData.push(makeUser(i, ORG1_ID));
}

export const programsData: PrismaProgram[] = [
	makeProgram(1, organizationsData[0].id, organizationsData[1].id),
	makeProgram(2, organizationsData[1].id, organizationsData[0].id),
	makeProgram(3, organizationsData[2].id, organizationsData[2].id),
];
const PROGRAM1_ID = programsData[0].id;
const PROGRAM2_ID = programsData[1].id;

export const localPartnersData: PrismaLocalPartner[] = [];
for (let i = 1; i <= LOCAL_PARTNER_COUNT; i++) {
	localPartnersData.push(makeLocalPartner(i, usersData[i - 1].id));
}
const LOCAL_PARTNER1_ID = localPartnersData[0].id;

export const recipientsData: PrismaRecipient[] = [];
for (let i = 1; i <= RECIPIENT_COUNT; i++) {
	const userId = usersData[i - 1].id;

	const programId = i % 2 === 0 ? PROGRAM2_ID : PROGRAM1_ID;

	recipientsData.push(
		makeRecipient(i, userId, ORG1_ID, programId, LOCAL_PARTNER1_ID)
	);
}

export const payoutsData: PrismaPayout[] = [];
for (let i = 0; i < recipientsData.length; i++) {
	const recipient = recipientsData[i];
	const paymentsCount = (i % 36) + 1;

	for (let m = 0; m < paymentsCount; m++) {
		payoutsData.push(makePayout(i + 1, recipient.id, paymentsCount - m));
	}
}
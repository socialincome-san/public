import {
	User as PrismaUser,
	Program as PrismaProgram,
	Organization as PrismaOrganization,
	Recipient as PrismaRecipient,
	LocalPartner as PrismaLocalPartner,
	Gender,
	UserRole,
	RecipientStatus,
} from "@prisma/client";

const now = () => new Date();

const ORGANIZATION_COUNT = 3;
const USER_COUNT = 150;
const PROGRAM_COUNT = 3;
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

const makeProgram = (i: number, orgId: string): PrismaProgram => ({
	id: `program-${i}`,
	name: `Program ${i}`,
	duration: 12,
	viewerOrganizationId: orgId,
	operatorOrganizationId: orgId,
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
): PrismaRecipient => ({
	id: `recipient-${i}`,
	userId,
	programId,
	status: Object.values(RecipientStatus)[(i - 1) % Object.values(RecipientStatus).length],
	createdAt: now(),
	updatedAt: null,
	organizationId: orgId,
	localPartnerId,
	startDate: null,
});

export const organizationsData: PrismaOrganization[] = [];
for (let i = 1; i <= ORGANIZATION_COUNT; i++) {
	organizationsData.push(makeOrganization(i));
}
const ORG1_ID = organizationsData[0].id;

export const usersData: PrismaUser[] = [];
for (let i = 1; i <= USER_COUNT; i++) {
	usersData.push(makeUser(i, ORG1_ID));
}

export const programsData: PrismaProgram[] = [];
for (let i = 1; i <= PROGRAM_COUNT; i++) {
	programsData.push(makeProgram(i, ORG1_ID));
}
const PROGRAM1_ID = programsData[0].id;

export const localPartnersData: PrismaLocalPartner[] = [];
for (let i = 1; i <= LOCAL_PARTNER_COUNT; i++) {
	localPartnersData.push(makeLocalPartner(i, usersData[i - 1].id));
}
const LOCAL_PARTNER1_ID = localPartnersData[0].id;

export const recipientsData: PrismaRecipient[] = [];
for (let i = 1; i <= RECIPIENT_COUNT; i++) {
	const userId = usersData[i - 1].id;
	recipientsData.push(makeRecipient(i, userId, ORG1_ID, PROGRAM1_ID, LOCAL_PARTNER1_ID));
}
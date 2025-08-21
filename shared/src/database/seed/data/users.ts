import { Gender, User as PrismaUser, UserRole } from '@prisma/client';
import { ORG1_ID } from './organizations';

const USER_COUNT = 150;

const makeUser = (i: number, orgId?: string): PrismaUser => ({
	id: `user-${i}`,
	email: `user${i}@test.org`,
	authUserId: i === 1 ? 'w43IydQbr8lgeGeevbSBoP9ui3WQ' : `auth-${i}`,
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
	currency: "CHF",
	addressStreet: null,
	addressNumber: null,
	addressCity: null,
	addressZip: null,
	addressCountry: 'CH',
	role: UserRole.user,
	organizationId: orgId ?? null,
	birthDate: new Date(1980 + (i % 30), i % 12, (i % 28) + 1),
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
	createdAt: new Date(),
	updatedAt: null,
});

export const usersData: PrismaUser[] = [];
for (let i = 1; i <= USER_COUNT; i++) {
	usersData.push(makeUser(i, ORG1_ID));
}

export const USER1_ID = usersData[0].id;
export const USER2_ID = usersData[1].id;
import { Gender, User as PrismaUser, UserRole } from '@prisma/client';
import { ORG1_ID } from './organizations';
import { LanguageCode } from '@prisma/client';

const USER_COUNT = 150;

const LANGUAGES = Object.values(LanguageCode);

const makeUser = (i: number, orgId?: string): PrismaUser => ({
	id: `user-${i}`,
	email: `user${i}@test.org`,
	authUserId: i === 1 ? 'w43IydQbr8lgeGeevbSBoP9ui3WQ' : `auth-${i}`,
	firstName: `First${i}`,
	lastName: `Last${i}`,
	gender: i % 2 === 0 ? Gender.female : Gender.male,
	company: null,
	referral: null,
	paymentReferenceId: null,
	stripeCustomerId: null,
	institution: false,
	language: LANGUAGES[Math.floor(Math.random() * LANGUAGES.length)],
	currency: "CHF",
	addressStreet: null,
	addressNumber: null,
	addressCity: null,
	addressZip: null,
	addressCountry: 'CH',
	role: UserRole.globalAdmin,
	organizationId: orgId ?? null,
	birthDate: new Date(1980 + (i % 30), i % 12, (i % 28) + 1),
	communicationPhone: '012 45 78 98 45',
	communicationPhoneHasWhatsApp: i % 2 === 0 ? true : false,
	communicationPhoneWhatsappActivated: i % 3 === 0 ? true : false,
	mobileMoneyPhone: '123 456 78',
	mobileMoneyPhoneHasWhatsApp: i % 2 === 0 ? true : false,
	instaHandle: `my_insta_${i}`,
	twitterHandle: `My_twitter_${i}`,
	profession: `Profession ${i}`,
	callingName: `Nickname ${i}`,
	omUid: i,
	createdAt: new Date(),
	updatedAt: null,
});

export const usersData: PrismaUser[] = [];
for (let i = 1; i <= USER_COUNT; i++) {
	usersData.push(makeUser(i, ORG1_ID));
}

export const USER1_ID = usersData[0].id;
export const USER2_ID = usersData[1].id;
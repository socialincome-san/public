import { User as PrismaUser } from '@prisma/client';
import { Program as PrismaProgram } from '@prisma/client';
import { Organization as PrismaOrganization } from '@prisma/client';

export const organizationData1: PrismaOrganization = {
	id: 'organization-1',
	name: 'Test Organization',
	createdAt: new Date(),
	updatedAt: null,
}

export const userData1: PrismaUser = {
	id: 'user-1',
	email: 'test@test.org',
	authUserId: 'w43IydQbr8lgeGeevbSBoP9ui3WQ',
	firstName: 'Test',
	lastName: 'User',
	gender: 'male',
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
	role: 'user',
	organizationId: organizationData1.id,
	birthDate: null,
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
	updatedAt: null
};

export const programData1: PrismaProgram = {
	id: 'program-1',
	name: 'Program One',
	duration: 0,
	viewerOrganizationId: organizationData1.id,
	operatorOrganizationId: organizationData1.id,
	createdAt: new Date(),
	updatedAt: null,
}

export const programData2: PrismaProgram = {
	id: 'program-2',
	name: 'Program Two',
	duration: 0,
	viewerOrganizationId: organizationData1.id,
	operatorOrganizationId: organizationData1.id,
	createdAt: new Date(),
	updatedAt: null,
}
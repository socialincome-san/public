import { Gender, Prisma, Recipient, RecipientStatus } from '@prisma/client';
import RecipientGetPayload = Prisma.RecipientGetPayload;

export type CreateRecipientInput = Omit<Recipient, 'id' | 'createdAt' | 'updatedAt'>;

export type ProgramPermission = 'operator' | 'viewer';

export type RecipientTableViewRow = {
	id: string;
	omUid: number;
	firstName: string;
	lastName: string;
	birthDate: Date;
	gender: Gender;
	status: RecipientStatus;
	payoutsReceived: number;
	payoutsTotal: number;
	payoutsProgressPercent: number;
	localPartnerName: string;
	programName: string;
	programId: string;
	permission: ProgramPermission;
	callingName?: string;
	communicationPhone?: string;
	communicationPhoneHasWhatsapp?: boolean;
	communicationPhoneWhatsappActivated?: boolean;
	organizationId?: string;
	mobileMoneyPhone?: string;
	mobileMoneyPhoneHasWhatsapp?: boolean;
	language?: string;
	profession?: string;
	email?: string;
	instaHandle?: string;
	twitterHandle?: string;
};

export type RecipientTableView = {
	tableRows: RecipientTableViewRow[];
};

export type RecipientWithPayouts = RecipientGetPayload<{ include: { payouts: true } }>;

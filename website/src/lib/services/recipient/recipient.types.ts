import {
	Address,
	Gender,
	PaymentProvider,
	PayoutStatus,
	Phone,
	Prisma,
	ProgramPermission,
	RecipientStatus,
} from '@prisma/client';

export type RecipientWithPaymentInfo = Prisma.RecipientGetPayload<{
	include: {
		contact: {
			include: {
				phone: true;
			};
		};
		paymentInformation: {
			include: {
				phone: true;
			};
		};
		program: true;
		localPartner: true;
	};
}>;

export type RecipientPayload = {
	id: string;
	startDate: Date | null;
	status: RecipientStatus;
	successorName: string | null;
	termsAccepted: boolean;
	localPartner: {
		id: string;
		name: string;
	};
	program: {
		id: string;
		name: string;
	} | null;
	contact: {
		id: string;
		firstName: string;
		lastName: string;
		callingName: string | null;
		email: string | null;
		gender: Gender | null;
		language: string | null;
		dateOfBirth: Date | null;
		profession: string | null;
		phone: Phone | null;
		address: Address | null;
	};
	paymentInformation: {
		id: string;
		code: string | null;
		provider: PaymentProvider;
		phone: Phone | null;
	} | null;
};

export type RecipientTableViewRow = {
	id: string;
	firstName: string;
	lastName: string;
	dateOfBirth: Date | null;
	localPartnerName: string | null;
	status: RecipientStatus;
	programId: string | null;
	programName: string | null;
	payoutsReceived: number;
	payoutsTotal: number;
	payoutsProgressPercent: number;
	createdAt: Date;
	permission: ProgramPermission;
};

export type RecipientTableView = {
	tableRows: RecipientTableViewRow[];
	permission: ProgramPermission;
};

export type PayoutRecipient = {
	id: string;
	contact: { firstName: string; lastName: string };
	paymentInformation: {
		code: string | null;
		phone: { number: string } | null;
	} | null;
	program: {
		payoutPerInterval: number;
		payoutCurrency: string;
		programDurationInMonths: number;
	};
	payouts: {
		paymentAt: Date;
		status: PayoutStatus;
	}[];
};

export type RecipientCreateInput = Prisma.RecipientCreateInput;
export type RecipientUpdateInput = Prisma.RecipientUpdateInput;
export type RecipientPrismaUpdateInput = Prisma.RecipientUpdateInput;

export type RecipientOption = {
	id: string;
	fullName: string;
};

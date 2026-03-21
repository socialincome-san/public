import { Address, Gender, PayoutInterval, Phone, Prisma } from '@/generated/prisma/client';
export type {
	RecipientProgramFilterOption,
	RecipientTableViewRow,
	UpcomingOnboardingTableViewRow,
} from './recipient-table.types';

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
				mobileMoneyProvider: true;
			};
		};
		program: {
			include: {
				country: {
					select: {
						isoCode: true;
						currency: true;
					};
				};
			};
		};
		localPartner: true;
	};
}>;

export type RecipientPayload = {
	id: string;
	startDate: Date | null;
	suspendedAt: Date | null;
	suspensionReason: string | null;
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
		mobileMoneyProvider: { id: string; name: string } | null;
		phone: Phone | null;
	} | null;
};

export type RecipientPrismaUpdateInput = Prisma.RecipientUpdateInput;

export type RecipientOption = {
	id: string;
	fullName: string;
};

export type RecipientLifecycleStatus = 'future' | 'active' | 'suspended' | 'completed';

export type RecipientLifecycleStatusInput = {
	startDate: Date | null;
	suspendedAt: Date | null;
	paidOrConfirmedCount: number;
	programDurationInMonths: number;
	payoutInterval: PayoutInterval;
	nowDate: Date;
};

export type RecipientLifecycleStatusFromExpectedIntervalsInput = {
	startDate: Date | null;
	suspendedAt: Date | null;
	paidOrConfirmedCount: number;
	expectedIntervals: number;
	nowDate: Date;
};

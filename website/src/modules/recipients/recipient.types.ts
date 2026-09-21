import type { CountryCode, Currency, Gender, PayoutInterval, ProgramPermission } from '@/generated/prisma/enums';
import { OBFUSCATED_SENTINEL } from '@/lib/utils/obfuscation';

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
	contact: RecipientContact;
	paymentInformation: RecipientPaymentInformation | null;
};

export type RecipientOption = {
	id: string;
	fullName: string;
};

export type RecipientFormOptions = {
	programs: { id: string; name: string }[];
	localPartner: { id: string; name: string }[];
};

export type RecipientProgramAssignment = {
	id: string;
	programId: string | null;
	localPartnerId: string;
};

type RecipientMessagingPhone = {
	number: string;
	hasWhatsApp: boolean;
};

export type RecipientMessagingTarget = {
	contactId: string;
	contact: {
		phone: RecipientMessagingPhone | null;
	};
	paymentInformation: {
		phone: RecipientMessagingPhone | null;
	} | null;
};

export type SurveyRecipientOption = {
	id: string;
	programId: string | null;
	startDate: Date | null;
	contact: {
		firstName: string;
		lastName: string;
	};
	program: {
		name: string;
	} | null;
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

export type RecipientTableViewRow = {
	id: string;
	firebaseAuthUserId: string;
	country: CountryCode | null;
	firstName: string;
	lastName: string;
	paymentCode: string | null;
	dateOfBirth: Date | typeof OBFUSCATED_SENTINEL | null;
	startDate: Date | null;
	localPartnerName: string | null;
	suspendedAt: Date | null;
	suspensionReason: string | null;
	programId: string | null;
	programName: string | null;
	payoutsReceived: number;
	payoutsTotal: number;
	payoutsProgressPercent: number;
	createdAt: Date;
	status: RecipientLifecycleStatus;
};

export type RecipientTableView = {
	tableRows: RecipientTableViewRow[];
	permission: ProgramPermission;
};

export type RecipientTableQuery = {
	page: number;
	pageSize: number;
	search: string;
	sortBy?: string;
	sortDirection?: 'asc' | 'desc';
	programId?: string;
	recipientStatus?: string;
};

export type RecipientProgramFilterOption = {
	id: string;
	name: string;
};

export type RecipientPaginatedTableView = {
	tableRows: RecipientTableViewRow[];
	totalCount: number;
	permission: ProgramPermission;
	programFilterOptions: RecipientProgramFilterOption[];
};

export type PublicRecipientTableViewRow = {
	country: CountryCode | null;
	firstName: string;
	lastName: string;
	dateOfBirth: Date | typeof OBFUSCATED_SENTINEL | null;
	startDate: Date | null;
	localPartnerName: string | null;
	payoutsProgressPercent: number;
	createdAt: Date;
	status: RecipientLifecycleStatus;
};

export type PublicRecipientTableView = {
	tableRows: PublicRecipientTableViewRow[];
	totalCount: number;
};

export type UpcomingOnboardingTableViewRow = {
	id: string;
	recipientName: string;
	programId: string;
	programName: string;
	localPartnerName: string;
	communicationPhoneNumber: string | null;
	startDate: Date;
	daysUntilStart: number;
	createdAt: Date;
};

export type RecipientUpcomingOnboardingPaginatedTableView = {
	tableRows: UpcomingOnboardingTableViewRow[];
	totalCount: number;
	programFilterOptions: RecipientProgramFilterOption[];
};

export type RecipientWithPaymentInfo = {
	id: string;
	legacyFirestoreId: string | null;
	contactId: string;
	startDate: Date | null;
	suspendedAt: Date | null;
	suspensionReason: string | null;
	successorName: string | null;
	termsAccepted: boolean;
	paymentInformationId: string | null;
	programId: string | null;
	localPartnerId: string;
	createdAt: Date;
	updatedAt: Date | null;
	contact: RecipientContactRecord;
	paymentInformation: RecipientPaymentInformationRecord | null;
	program: RecipientProgramRecord | null;
	localPartner: RecipientLocalPartnerRecord;
};

type RecipientContact = {
	id: string;
	firstName: string;
	lastName: string;
	callingName: string | null;
	email: string | null;
	gender: Gender | null;
	language: string | null;
	dateOfBirth: Date | null;
	profession: string | null;
	phone: RecipientPhone | null;
	address: RecipientAddress | null;
};

type RecipientPaymentInformation = {
	id: string;
	code: string | null;
	mobileMoneyProvider: { id: string; name: string } | null;
	phone: RecipientPhone | null;
};

type RecipientPhone = {
	id: string;
	number: string;
	hasWhatsApp: boolean;
	createdAt: Date;
	updatedAt: Date | null;
};

type RecipientAddress = {
	id: string;
	street: string;
	number: string;
	city: string;
	zip: string;
	country: CountryCode;
	createdAt: Date;
	updatedAt: Date | null;
};

type RecipientContactRecord = Omit<RecipientContact, 'address'> & {
	phoneId: string | null;
	isInstitution: boolean;
	createdAt: Date;
	updatedAt: Date | null;
};

type RecipientPaymentInformationRecord = RecipientPaymentInformation & {
	mobileMoneyProviderId: string | null;
	phoneId: string | null;
	createdAt: Date;
	updatedAt: Date | null;
	mobileMoneyProvider: {
		id: string;
		name: string;
		payoutProcess: string | null;
		parentId: string | null;
		createdAt: Date;
		updatedAt: Date | null;
	} | null;
};

type RecipientProgramRecord = {
	id: string;
	name: string;
	slug: string;
	amountOfRecipientsForStart: number | null;
	coveredByReserves: boolean;
	programDurationInMonths: number;
	payoutPerInterval: { toJSON: () => string; toString: () => string };
	payoutInterval: PayoutInterval;
	targetProfiles: string[];
	countryId: string;
	country: {
		isoCode: string;
		currency: Currency;
	};
	createdAt: Date;
	updatedAt: Date | null;
};

type RecipientLocalPartnerRecord = {
	id: string;
	accountId: string;
	legacyFirestoreId: string | null;
	name: string;
	slug: string;
	contactId: string;
	createdAt: Date;
	updatedAt: Date | null;
	contact: RecipientContactRecord;
};

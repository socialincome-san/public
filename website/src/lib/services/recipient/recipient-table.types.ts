import { CountryCode, ProgramPermission } from '@/generated/prisma/client';
import { OBFUSCATED_SENTINEL } from '@/lib/utils/obfuscation';
import type { RecipientLifecycleStatus } from './recipient.types';

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

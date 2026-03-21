import { ProgramPermission } from '@/generated/prisma/client';

export type DonationCertificateTableViewRow = {
	id: string;
	year: number;
	contributorFirstName: string;
	contributorLastName: string;
	email: string;
	storagePath: string;
	createdAt: Date;
	permission: ProgramPermission;
};

export type DonationCertificateTableQuery = {
	page: number;
	pageSize: number;
	search: string;
	sortBy?: string;
	sortDirection?: 'asc' | 'desc';
};

export type DonationCertificatePaginatedTableView = {
	tableRows: DonationCertificateTableViewRow[];
	totalCount: number;
};

export type YourDonationCertificateTableViewRow = {
	id: string;
	year: number;
	language: string | null;
	storagePath: string | null;
	createdAt: Date;
};

export type YourDonationCertificateTableQuery = {
	page: number;
	pageSize: number;
	search: string;
	sortBy?: string;
	sortDirection?: 'asc' | 'desc';
};

export type YourDonationCertificatePaginatedTableView = {
	tableRows: YourDonationCertificateTableViewRow[];
	totalCount: number;
};

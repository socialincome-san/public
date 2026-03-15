import { OrganizationPermission } from '@/generated/prisma/client';

export type DonationCertificateTableViewRow = {
	id: string;
	year: number;
	contributorFirstName: string;
	contributorLastName: string;
	email: string;
	storagePath: string;
	createdAt: Date;
	permission: OrganizationPermission;
};

type DonationCertificateTableView = {
	tableRows: DonationCertificateTableViewRow[];
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

type YourDonationCertificateTableView = {
	tableRows: YourDonationCertificateTableViewRow[];
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

import { OrganizationPermission, Prisma } from '@prisma/client';

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

export type DonationCertificateTableView = {
	tableRows: DonationCertificateTableViewRow[];
};

export type DonationCertificateCreateManyInput = Prisma.DonationCertificateCreateManyInput;

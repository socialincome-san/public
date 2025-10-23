import { ProgramPermission } from '@prisma/client';

export type DonationCertificateTableViewRow = {
	id: string;
	year: number;
	contributorFirstName: string;
	contributorLastName: string;
	email: string | null;
	programName: string;
	storagePath: string | null;
	createdAt: Date;
	createdAtFormatted: string;
	permission: ProgramPermission;
};

export type DonationCertificateTableView = {
	tableRows: DonationCertificateTableViewRow[];
};

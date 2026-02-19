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

export type DonationCertificateTableView = {
  tableRows: DonationCertificateTableViewRow[];
};

export type YourDonationCertificateTableViewRow = {
  id: string;
  year: number;
  language: string | null;
  storagePath: string | null;
  createdAt: Date;
};

export type YourDonationCertificateTableView = {
  tableRows: YourDonationCertificateTableViewRow[];
};

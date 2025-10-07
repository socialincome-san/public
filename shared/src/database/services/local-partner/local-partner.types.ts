import { LocalPartner } from '@prisma/client';

export type CreateLocalPartnerInput = Omit<LocalPartner, 'id' | 'createdAt' | 'updatedAt'>;

export type LocalPartnerTableViewRow = {
	id: string;
	name: string;
	contactPerson: string;
	contactNumber: string | null;
	recipientsCount: number;
};

export type LocalPartnerTableView = {
	tableRows: LocalPartnerTableViewRow[];
};

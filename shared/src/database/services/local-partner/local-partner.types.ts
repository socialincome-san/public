import { $Enums, LocalPartner } from '@prisma/client';

export type CreateLocalPartnerInput = Omit<LocalPartner, 'id' | 'createdAt' | 'updatedAt'>;

export type LocalPartnerTableViewRow = {
	id: string;
	name: string;
	contactPerson: string;
	contactNumber: string | null;
	recipientsCount: number;
};

// TODO: temporary type
export type LocalPartnerPayload = {
	id: string;
	name: string;
	contact: {
		firstName: string;
		lastName: string;
		gender: $Enums.Gender | null;
	};
};

export type LocalPartnerTableView = {
	tableRows: LocalPartnerTableViewRow[];
};

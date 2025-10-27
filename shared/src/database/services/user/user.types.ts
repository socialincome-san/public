import { UserRole } from '@prisma/client';

export type UserInformation = {
	id: string;
	firstName: string | null;
	lastName: string | null;
	role: UserRole;
	activeOrganization: {
		id: string;
		name: string;
	} | null;
	organizations: {
		id: string;
		name: string;
	}[];
	programs: {
		id: string;
		name: string;
	}[];
};

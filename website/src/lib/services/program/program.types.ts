import { ProgramPermission, UserRole } from '@prisma/client';

export type ProgramWallet = {
	id: string;
	programName: string;
	country: string;
	payoutCurrency: string;
	recipientsCount: number;
	totalPayoutsSum: number;
	permission: ProgramPermission;
};

export type ProgramWallets = {
	wallets: ProgramWallet[];
};

export type ProgramMemberTableViewRow = {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	role: UserRole | null;
	permission: ProgramPermission;
};

export type ProgramMemberTableView = {
	tableRows: ProgramMemberTableViewRow[];
};

export type ProgramOption = {
	id: string;
	name: string;
};

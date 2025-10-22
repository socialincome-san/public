export type OrganizationInformation = {
	id: string;
	name: string;
};

export type OrganizationTableViewRow = {
	id: string;
	name: string;
	ownedProgramsCount: number;
	operatedProgramsCount: number;
	usersCount: number;
};

export type OrganizationTableView = {
	tableRows: OrganizationTableViewRow[];
};

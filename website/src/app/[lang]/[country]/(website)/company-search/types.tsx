export type Company = {
	uid: string,
	name: string, 
}

export interface CompanyRegistry {
	searchCompanies(searchTerm: string) : Promise<Company[]>;

	// createInstance<T extends CompanyRegistry>() : T;
}

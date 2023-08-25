export type Company = {
	uid: string,
	name: string, 
}

export interface CompanyRegistry {
	searchCompanies(searchTerm: string) : Company[];

        static createInstance<T extends CompanyRegistry>() : T; 
}

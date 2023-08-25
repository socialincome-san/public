import { Company } from './types'; 

export class ZefixCompanyRegistry implements CompanyRegistry {
	searchCompanies(searchTerm: string) : Company[] {
		let result = await zefixSearchCompanies(searchTerm);
		return result
	}

	static createInstance() : ZefixCompanyRegistry {
		return new ZefixCompanyRegistry()
	}
}

async function zefixSearchCompanies(searchTerm: string, registry: CompanyRegister) : Promise<Company[]> {
	return fetch("http://localhost:3001/api/companies/ch?" + new URLSearchParams({ searchTerm : searchTerm}))
		.then((response) => { if (!response.ok) { throw new Error("could not retrieve companies") } else { return response }} )
		.then((response) => response.json())
}

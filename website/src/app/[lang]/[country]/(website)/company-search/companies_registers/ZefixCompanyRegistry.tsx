import { Company, CompanyRegistry } from '@/app/[lang]/[country]/(website)/company-search/types';

export class ZefixCompanyRegistry implements CompanyRegistry {
	async searchCompanies(searchTerm: string): Promise<Company[]> {
		return fetch('http://localhost:3001/api/companies/ch?' + new URLSearchParams({ searchTerm: searchTerm }))
			.then((response) => {
				if (!response.ok) {
					throw new Error('could not retrieve companies');
				} else {
					return response;
				}
			})
			.then((response) => response.json());
		//        throw new Error("Method not implemented.");
	}

	// static _registry: ZefixCompanyRegistry;
	// static createInstance<T extends CompanyRegistry>(): T {
	//     if (ZefixCompanyRegistry == undefined) {
	//         this._registry = new ZefixCompanyRegistry();
	//     }
	//     return this._registry;
	// }
}

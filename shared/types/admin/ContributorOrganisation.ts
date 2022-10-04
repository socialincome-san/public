export const CONTRIBUTOR_ORGANISATION_FIRESTORE_PATH = 'organisations-contributors';

export type ContributorOrganisation = {
	org_name: string;
	org_name_en: string;
	org_name_de: string;
	org_name_fr: string;
	org_name_it: string;
	alt_search_terms: string[];
	country: string;
	global: boolean;
	public_sector: boolean;
	workforce_number: number;
	workforce_scale: string;
};

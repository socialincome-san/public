import { CountryFormUpdateInput } from './country-form-input';

export type CountryUpdateUniquenessContext = {
	countryId: string;
	existingIsoCode: CountryFormUpdateInput['isoCode'];
};

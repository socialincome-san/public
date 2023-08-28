import { DefaultPageProps } from '@/app/[lang]/[country]';
import { CompanyRegistry } from '@/app/[lang]/[country]/(website)/company-search/types';
import { ZefixCompanyRegistry } from './ZefixCompanyRegistry';

export default function getCompanyRegistry({ params }: DefaultPageProps): CompanyRegistry {
	if (params.country === 'ch') {
		return new ZefixCompanyRegistry();
	} else {
		throw new Error('Not supported country: ' + params.country);
		// TODO add default CompanyRegistry
	}
}

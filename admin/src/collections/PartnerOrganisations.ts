import { buildCollection, buildProperties } from '@camberi/firecms';
import { Organisation } from '@socialincome/shared/types';
import { BuildCollectionProps } from './index';

export const buildPartnerOrganisationsCollection = ({ isGlobalAdmin = false }: BuildCollectionProps) => {
	return buildCollection<Organisation>({
		name: 'Partner Organisations',
		group: 'Admin',
		icon: 'CorporateFare',
		description: 'Lists all our partner organisations',
		path: 'organisations',
		customId: true,
		properties: buildProperties<Organisation>({
			name: {
				dataType: 'string',
				disabled: !isGlobalAdmin,
			},
		}),
	});
};

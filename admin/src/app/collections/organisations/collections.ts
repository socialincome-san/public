import { buildCollection, buildProperties } from '@camberi/firecms';
import { Organisation } from './interface';
import { BuildCollectionProps } from '../index';

export const buildOrganisationsCollection = ({ isGlobalAdmin = false }: BuildCollectionProps) => {
	return buildCollection<Organisation>({
		name: 'Local NGOs',
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

import { buildProperties } from '@camberi/firecms';
import { PartnerOrganisation, PARTNER_ORGANISATION_FIRESTORE_PATH } from '../../../shared/src/types';
import { BuildCollectionProps } from './index';
import { buildAuditedCollection } from './shared';

export const buildPartnerOrganisationsCollection = ({ isGlobalAdmin = false }: BuildCollectionProps) => {
	return buildAuditedCollection<PartnerOrganisation>({
		name: 'Partner Organisations',
		group: 'Admin',
		path: PARTNER_ORGANISATION_FIRESTORE_PATH,
		icon: 'CorporateFare',
		description: 'Lists all our partner organisations',
		hideFromNavigation: !isGlobalAdmin,
		customId: true,
		properties: buildProperties<PartnerOrganisation>({
			name: {
				dataType: 'string',
				disabled: !isGlobalAdmin,
			},
		}),
	});
};

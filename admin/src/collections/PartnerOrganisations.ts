import {
	PARTNER_ORGANISATION_FIRESTORE_PATH,
	PartnerOrganisation,
} from '@socialincome/shared/src/types/partner-organisation';
import { buildProperties } from 'firecms';
import { buildAuditedCollection } from './shared';

export const buildPartnerOrganisationsCollection = () => {
	return buildAuditedCollection<PartnerOrganisation>({
		name: 'Partner Organisations',
		group: 'Admin',
		path: PARTNER_ORGANISATION_FIRESTORE_PATH,
		icon: 'CorporateFare',
		description: 'Lists all our partner organisations',
		customId: true,
		properties: buildProperties<PartnerOrganisation>({
			name: {
				dataType: 'string',
				name: 'Org Name',
			},
			contactName: {
				dataType: 'string',
				name: 'Contact Person',
			},
			contactNumber: {
				dataType: 'string',
				name: 'Contact Number',
			},
			communitySize: {
				dataType: 'number',
				name: 'Community Size',
			},
		}),
	});
};

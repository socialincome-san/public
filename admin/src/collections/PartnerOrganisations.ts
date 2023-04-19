import { buildProperties } from 'firecms';
import { PartnerOrganisation, PARTNER_ORGANISATION_FIRESTORE_PATH } from '../../../shared/src/types';
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
			},
			contactName: {
				dataType: 'string',
			},
			contactNumber: {
				dataType: 'string',
			},
		}),
	});
};

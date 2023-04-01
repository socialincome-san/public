import { buildCollection, EntityReference, useSideEntityController } from '@camberi/firecms';
import { EntityCollection } from '@camberi/firecms/dist/types';

import { Button } from '@mui/material';

import { EntityOnSaveProps } from '@camberi/firecms/dist/types/entity_callbacks';
import { Recipient, RecipientProgramStatus, RECIPIENT_FIRESTORE_PATH } from '@socialincome/shared/src/types';
import { isUndefined } from 'lodash';
import { buildAuditedCollection } from '../shared';
import {
	birthDateProperty,
	callingNameProperty,
	communicationMobilePhoneProperty,
	firstNameProperty,
	genderProperty,
	lastNameProperty,
	mainLanguageProperty,
	orangeMoneyUIDProperty,
	professionProperty,
	programStatusProperty,
	speaksEnglishProperty,
} from './RecipientsProperties';

export const buildRecipientsPartnerOrgAdminCollection = (organisations: EntityReference[]) => {
	const onPreSave = ({ previousValues, values }: EntityOnSaveProps) => {
		// Organisation is set automatically if admin user can only see one organisation
		if (organisations.length === 1) {
			values.organisation = organisations[0];
		} else if (!values?.organisation?.id || organisations.map((o) => o.id).indexOf(values.organisation.id) === -1) {
			throw Error('Please select a valid organisation.');
		}
		if (isUndefined(previousValues)) {
			values.progr_status = RecipientProgramStatus.Waitlisted;
		}
		return values;
	};

	function CustomAction() {
		const customProductCollection = buildCollection<Partial<Recipient>>({
			path: RECIPIENT_FIRESTORE_PATH,
			name: 'New Recipient',
			properties: {
				first_name: firstNameProperty,
				last_name: lastNameProperty,
				gender: genderProperty,
				communication_mobile_phone: communicationMobilePhoneProperty,
				main_language: mainLanguageProperty,
				speaks_english: speaksEnglishProperty,
			},
			callbacks: { onPreSave: onPreSave },
		});

		const sideEntityController = useSideEntityController();
		return (
			<Button
				variant="contained"
				onClick={() =>
					sideEntityController.open({
						// entityId: 'B003WT1622',
						path: RECIPIENT_FIRESTORE_PATH,
						collection: customProductCollection,
						width: 800,
					})
				}
			>
				Add New Recipient
			</Button>
		);
	}

	let collection: EntityCollection<Partial<Recipient>> = {
		inlineEditing: false,
		description: 'Lists of people, who receive a Social Income',
		group: 'Recipients',
		icon: 'RememberMeTwoTone',
		initialSort: ['om_uid', 'asc'],
		name: 'Recipients',
		path: RECIPIENT_FIRESTORE_PATH,
		singularName: 'Recipient',
		textSearchEnabled: true,
		Actions: [CustomAction],
		permissions: {
			create: false,
			delete: false,
			edit: true,
		},
		properties: {
			om_uid: { ...orangeMoneyUIDProperty, disabled: true },
			first_name: firstNameProperty,
			last_name: lastNameProperty,
			calling_name: callingNameProperty,
			progr_status: { ...programStatusProperty, disabled: true },
			communication_mobile_phone: { ...communicationMobilePhoneProperty, hideFromCollection: true },
			gender: genderProperty,
			birth_date: birthDateProperty,
			main_language: mainLanguageProperty,
			profession: professionProperty,
			speaks_english: speaksEnglishProperty,
		},
		callbacks: { onPreSave: onPreSave },
		forceFilter: {
			organisation: ['in', organisations || []],
		},
	};
	return buildAuditedCollection<Partial<Recipient>>(collection);
};

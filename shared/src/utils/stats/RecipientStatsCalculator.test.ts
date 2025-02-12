import { DocumentReference, Timestamp } from 'firebase-admin/firestore';
import functions from 'firebase-functions-test';
import { FirestoreAdmin } from '../../firebase/admin/FirestoreAdmin';
import { getOrInitializeFirebaseAdmin } from '../../firebase/admin/app';
import { PARTNER_ORGANISATION_FIRESTORE_PATH, PartnerOrganisation } from '../../types/partner-organisation';
import {
	RECIPIENT_FIRESTORE_PATH,
	Recipient,
	RecipientMainLanguage,
	RecipientProgramStatus,
} from '../../types/recipient';
import { RecipientStatsCalculator } from './RecipientStatsCalculator';

const projectId = 'contribution-stats-calculator-test';
const testEnv = functions({ projectId: projectId });
const firestoreAdmin = new FirestoreAdmin(getOrInitializeFirebaseAdmin({ projectId: projectId }));
let calculator: RecipientStatsCalculator;

beforeAll(async () => {
	await testEnv.firestore.clearFirestoreData({ projectId: projectId });
	await insertTestData();
	calculator = await RecipientStatsCalculator.build(firestoreAdmin);
});

test('totalRecipients(): Calculate total recipients', async () => {
	expect(calculator.allStats().totalRecipients.total).toEqual(3);
});

test('totalRecipients(): Calculate active recipients', async () => {
	expect(calculator.allStats().totalRecipients.active).toEqual(1);
});

test('totalRecipientsByOrganization(): Calculate total recipients for a particular organisation', async () => {
	expect(calculator.allStats().totalRecipientsByOrganization['aurora'].total).toEqual(2);
});

test('totalRecipientsByOrganization(): Calculate active recipients for a particular organisation', async () => {
	expect(calculator.allStats().totalRecipientsByOrganization['aurora'].active).toEqual(1);
});

test('totalRecipientsByOrganization(): Calculate suspended recipients for a particular organisation', async () => {
	expect(calculator.allStats().totalRecipientsByOrganization['aurora'].suspended).toEqual(1);
});

test('totalRecipientsByOrganization(): Calculate recipients for a non-existing organisation', async () => {
	expect(calculator.allStats().totalRecipientsByOrganization['socialincome']?.total).toEqual(undefined);
});

const org1: PartnerOrganisation = {
	name: 'aurora',
	contactName: 'test1',
	contactNumber: '123',
};

const org2: PartnerOrganisation = {
	name: 'socialincome',
	contactName: 'test2',
	contactNumber: '456',
};

const recipient1: Recipient = {
	birth_date: new Date('1990-05-15'),
	calling_name: 'John',
	communication_mobile_phone: {
		phone: 1234567890,
		has_whatsapp: true,
		whatsapp_activated: true,
	},
	email: 'john.doe@example.com',
	first_name: 'John',
	gender: 'male',
	insta_handle: '@john_doe',
	last_name: 'Doe',
	main_language: RecipientMainLanguage.English,
	mobile_money_phone: {
		phone: 9876543210,
		has_whatsapp: true,
	},
	organisation: { id: 'aurora' } as DocumentReference<PartnerOrganisation>,
	om_uid: 12345,
	profession: 'Software Engineer',
	progr_status: RecipientProgramStatus.Active,
	si_start_date: new Timestamp(1609459200, 0),
	test_recipient: false,
	twitter_handle: '@john_doe_tech',
	successor: 'Jane Doe',
};

const recipient2: Recipient = {
	birth_date: new Date('1990-05-15'),
	calling_name: 'Jane',
	communication_mobile_phone: {
		phone: 1234567890,
		has_whatsapp: true,
		whatsapp_activated: true,
	},
	email: 'jane.doe@example.com',
	first_name: 'Jane',
	gender: 'female',
	insta_handle: '@jane_doe',
	last_name: 'Doe',
	main_language: RecipientMainLanguage.English,
	mobile_money_phone: {
		phone: 9876543210,
		has_whatsapp: true,
	},
	organisation: { id: 'aurora' } as DocumentReference<PartnerOrganisation>,
	om_uid: 12345,
	profession: 'Software Engineer',
	progr_status: RecipientProgramStatus.Suspended,
	si_start_date: new Timestamp(1609459200, 0),
	test_recipient: false,
	twitter_handle: '@john_doe_tech',
	successor: 'Jane Doe',
};

const recipient3: Recipient = {
	birth_date: new Date('1990-05-15'),
	calling_name: 'Jack',
	communication_mobile_phone: {
		phone: 1234567890,
		has_whatsapp: true,
		whatsapp_activated: true,
	},
	email: 'jack.doe@example.com',
	first_name: 'Jack',
	gender: 'male',
	insta_handle: '@jack_doe',
	last_name: 'Doe',
	main_language: RecipientMainLanguage.English,
	mobile_money_phone: {
		phone: 9876543210,
		has_whatsapp: true,
	},
	organisation: { id: 'socialincome' } as DocumentReference<PartnerOrganisation>,
	om_uid: 12345,
	profession: 'Software Engineer',
	progr_status: RecipientProgramStatus.Waitlisted,
	si_start_date: new Timestamp(1609459200, 0),
	test_recipient: false,
	twitter_handle: '@jack_doe_tech',
	successor: 'Jane Doe',
};

const insertTestData = async () => {
	await firestoreAdmin.collection<PartnerOrganisation>(PARTNER_ORGANISATION_FIRESTORE_PATH).doc('aurora').set(org1);
	await firestoreAdmin
		.collection<PartnerOrganisation>(PARTNER_ORGANISATION_FIRESTORE_PATH)
		.doc('socialincome')
		.set(org2);
	const recipient1WithOrgRef: Recipient = {
		...recipient1,
		organisation: firestoreAdmin
			.collection<PartnerOrganisation>(PARTNER_ORGANISATION_FIRESTORE_PATH)
			.doc('aurora') as DocumentReference<PartnerOrganisation>,
	};
	const recipient2WithOrgRef: Recipient = {
		...recipient2,
		organisation: firestoreAdmin
			.collection<PartnerOrganisation>(PARTNER_ORGANISATION_FIRESTORE_PATH)
			.doc('aurora') as DocumentReference<PartnerOrganisation>,
	};
	const recipient3WithOrgRef: Recipient = {
		...recipient3,
		organisation: firestoreAdmin
			.collection<PartnerOrganisation>(PARTNER_ORGANISATION_FIRESTORE_PATH)
			.doc('socialincome') as DocumentReference<PartnerOrganisation>,
	};
	await firestoreAdmin.collection<Recipient>(RECIPIENT_FIRESTORE_PATH).add(recipient1WithOrgRef);
	await firestoreAdmin.collection<Recipient>(RECIPIENT_FIRESTORE_PATH).add(recipient2WithOrgRef);
	await firestoreAdmin.collection<Recipient>(RECIPIENT_FIRESTORE_PATH).add(recipient3WithOrgRef);
};

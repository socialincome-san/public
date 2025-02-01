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
	expect(calculator.allStats().totalRecipients.total).toEqual(1);
});

test('totalRecipients(): Calculate active recipients', async () => {
	expect(calculator.allStats().totalRecipients.active).toEqual(1);
});

test('totalRecipientsByOrganization(): Calculate total recipients for a particular organisation', async () => {
	expect(calculator.allStats().totalRecipientsByOrganization['aurora'].total).toEqual(1);
});

test('totalRecipientsByOrganization(): Calculate active recipients for a particular organisation', async () => {
	expect(calculator.allStats().totalRecipientsByOrganization['aurora'].total).toEqual(1);
});

const org1: PartnerOrganisation = {
	name: 'aurora',
	contactName: 'test1',
	contactNumber: '123',
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

const insertTestData = async () => {
	await firestoreAdmin.collection<PartnerOrganisation>(PARTNER_ORGANISATION_FIRESTORE_PATH).doc('aurora').set(org1);
	const recipientWithOrgRef: Recipient = {
		...recipient1,
		organisation: firestoreAdmin
			.collection<PartnerOrganisation>(PARTNER_ORGANISATION_FIRESTORE_PATH)
			.doc('aurora') as DocumentReference<PartnerOrganisation>,
	};
	await firestoreAdmin.collection<Recipient>(RECIPIENT_FIRESTORE_PATH).add(recipientWithOrgRef);
};

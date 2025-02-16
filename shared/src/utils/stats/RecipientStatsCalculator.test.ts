import { Timestamp } from 'firebase-admin/firestore';
import functions from 'firebase-functions-test';
import { FirestoreAdmin } from '../../firebase/admin/FirestoreAdmin';
import { getOrInitializeFirebaseAdmin } from '../../firebase/admin/app';
import { PARTNER_ORGANISATION_FIRESTORE_PATH, PartnerOrganisation } from '../../types/partner-organisation';
import {
	Recipient,
	RECIPIENT_FIRESTORE_PATH,
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

const org1: PartnerOrganisation = {
	name: 'Aurora',
	contactName: 'test1',
	contactNumber: '123',
	communitySize: 10,
};
const org1Ref = firestoreAdmin.collection<PartnerOrganisation>(PARTNER_ORGANISATION_FIRESTORE_PATH).doc('aurora');

const org2: PartnerOrganisation = {
	name: 'Social Income',
	contactName: 'test2',
	contactNumber: '456',
	communitySize: 20,
};
const org2Ref = firestoreAdmin
	.collection<PartnerOrganisation>(PARTNER_ORGANISATION_FIRESTORE_PATH)
	.doc('social-income');

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
	organisation: org1Ref,
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
	organisation: org2Ref,
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
	organisation: org2Ref,
	om_uid: 12345,
	profession: 'Software Engineer',
	progr_status: RecipientProgramStatus.Waitlisted,
	si_start_date: new Timestamp(1609459200, 0),
	test_recipient: false,
	twitter_handle: '@jack_doe_tech',
	successor: 'Jane Doe',
};

const insertTestData = async () => {
	await org1Ref.set(org1);
	await org2Ref.set(org2);
	await firestoreAdmin.collection<Recipient>(RECIPIENT_FIRESTORE_PATH).add(recipient1);
	await firestoreAdmin.collection<Recipient>(RECIPIENT_FIRESTORE_PATH).add(recipient2);
	await firestoreAdmin.collection<Recipient>(RECIPIENT_FIRESTORE_PATH).add(recipient3);
};

test('Calculate recipient statistics', async () => {
	const stats = calculator.allStats();

	// Verify total number of recipients across all organizations
	expect(stats.recipientsCountByStatus['total']).toEqual(3);

	// Verify number of recipients by status
	expect(stats.recipientsCountByStatus[RecipientProgramStatus.Active]).toEqual(1);
	expect(stats.recipientsCountByStatus[RecipientProgramStatus.Suspended]).toEqual(1);
	expect(stats.recipientsCountByStatus[RecipientProgramStatus.Waitlisted]).toEqual(1);
	expect(stats.recipientsCountByStatus[RecipientProgramStatus.Former]).toEqual(undefined);

	// Verify total number of recipients for organization 1
	expect(stats.recipientsCountByOrganisationAndStatus[org1Ref.id]!['total']).toEqual(1);

	// Verify number of active recipients for organization 1
	expect(stats.recipientsCountByOrganisationAndStatus[org1Ref.id]![RecipientProgramStatus.Active]).toEqual(1);

	// Verify suspended recipients status:
	// - Organization 1 should have no suspended recipients (undefined) and 1 active recipient
	// - Organization 2 should have 1 suspended recipient
	expect(stats.recipientsCountByOrganisationAndStatus[org1Ref.id]![RecipientProgramStatus.Suspended]).toEqual(
		undefined,
	);
	expect(stats.recipientsCountByOrganisationAndStatus[org1Ref.id]![RecipientProgramStatus.Active]).toEqual(1);
	expect(stats.recipientsCountByOrganisationAndStatus[org2Ref.id]![RecipientProgramStatus.Suspended]).toEqual(1);
	expect(stats.recipientsCountByOrganisationAndStatus[org2Ref.id]![RecipientProgramStatus.Active]).toEqual(undefined);
	expect(stats.recipientsCountByOrganisationAndStatus[org2Ref.id]![RecipientProgramStatus.Waitlisted]).toEqual(1);

	// Verify total recipients count for each organization:
	// - Organization 1 should have 1 recipient
	// - Organization 2 should have 2 recipients
	expect(stats.recipientsCountByOrganisationAndStatus[org1Ref.id]!['total']).toEqual(1);
	expect(stats.recipientsCountByOrganisationAndStatus[org2Ref.id]!['total']).toEqual(2);
});

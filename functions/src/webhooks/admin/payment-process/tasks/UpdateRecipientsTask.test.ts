import { FieldValue } from '@google-cloud/firestore';
import { expect } from '@jest/globals';
import { getOrInitializeFirebaseAdmin } from '@socialincome/shared/src/firebase/admin/app';
import { FirestoreAdmin } from '@socialincome/shared/src/firebase/admin/FirestoreAdmin';
import functionsTest from 'firebase-functions-test';
import { DateTime } from 'luxon';
import {
	PaymentProcessTaskType,
	Recipient,
	RECIPIENT_FIRESTORE_PATH,
	toPaymentDate,
} from '../../../../../../shared/src/types';
import { initializeGlobalTestData } from '../../../../firebase';
import { runPaymentProcessTask } from '../../../index';

const projectId = 'update-recipients-task-test';
const testEnv = functionsTest({ projectId });
const paymentDate = toPaymentDate(DateTime.fromObject({ year: 2023, month: 4, day: 15 }, { zone: 'utc' }));
const triggerFunction = testEnv.wrap(runPaymentProcessTask);
const firestoreAdmin = new FirestoreAdmin(getOrInitializeFirebaseAdmin({ projectId }));

beforeEach(async () => {
	await initializeGlobalTestData(projectId);
});

afterEach(async () => {
	await testEnv.firestore.clearFirestoreData({ projectId });
	testEnv.cleanup();
});

test('UpdateRecipients 1', async () => {
	const result = await triggerFunction(
		{ type: PaymentProcessTaskType.UpdateRecipients, timestamp: paymentDate.toSeconds() },
		{ auth: { token: { email: 'admin@socialincome.org' } } }
	);
	expect(result).toEqual('Set status of 1 recipients to active and 0 recipients to former');
});

test('UpdateRecipients 2', async () => {
	await firestoreAdmin
		.doc<Recipient>(RECIPIENT_FIRESTORE_PATH, '3RqjohcNgUXaejFC7av8')
		.update({ om_uid: FieldValue.delete() });

	await expect(
		triggerFunction(
			{ type: PaymentProcessTaskType.UpdateRecipients, timestamp: paymentDate.toSeconds() },
			{ auth: { token: { email: 'admin@socialincome.org' } } }
		)
	).rejects.toThrow('Orange Money Id missing for designated recipient');
});

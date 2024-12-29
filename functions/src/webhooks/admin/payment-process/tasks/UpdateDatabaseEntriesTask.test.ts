import functionsTest from 'firebase-functions-test';
import { DateTime } from 'luxon';
import { getOrInitializeFirebaseAdmin } from '../../../../../../shared/src/firebase/admin/app';
import { FirestoreAdmin } from '../../../../../../shared/src/firebase/admin/FirestoreAdmin';
import {
	Payment,
	PAYMENT_FIRESTORE_PATH,
	PaymentProcessTaskType,
	PaymentStatus,
} from '../../../../../../shared/src/types/payment';
import {
	Recipient,
	RECIPIENT_FIRESTORE_PATH,
	RecipientProgramStatus,
	toPaymentDate,
} from '../../../../../../shared/src/types/recipient';
import { toDateTime } from '../../../../../../shared/src/utils/date';
import { initializeGlobalTestData } from '../../../../firebase';
import { runPaymentProcessTask } from '../../../index';

const projectId = 'create-payments-task-test';
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

test('CreatePayments', async () => {
	const result = await triggerFunction({
		data: { type: PaymentProcessTaskType.CreatePayments, timestamp: paymentDate.toSeconds() },
		// @ts-ignore
		auth: { token: { email: 'admin@socialincome.org' } },
	});
	expect(result).toEqual(
		'Set status of 3 payments to paid and created 3 payments for next month. Set status to "former" for 0 recipients and status to active for 1 recipients.',
	);

	const recipientDocs = (
		await firestoreAdmin
			.collection<Recipient>(RECIPIENT_FIRESTORE_PATH)
			.where('progr_status', '==', RecipientProgramStatus.Active)
			.get()
	).docs;
	expect(recipientDocs).toHaveLength(3);

	for (const recipientDoc of recipientDocs) {
		const paymentDoc = await firestoreAdmin
			.doc<Payment>(
				`${RECIPIENT_FIRESTORE_PATH}/${recipientDoc.id}/${PAYMENT_FIRESTORE_PATH}`,
				paymentDate.toFormat('yyyy-MM'),
			)
			.get();
		expect(paymentDoc.exists).toBeTruthy();
		const payment = paymentDoc.data() as Payment;
		expect(payment.amount).toEqual(700);
		expect(payment.payment_at.toMillis()).toEqual(paymentDate.toMillis());
		expect(payment.status).toEqual(PaymentStatus.Paid);
		expect(payment.currency).toEqual('SLE');

		const nextMonthPaymentDate = paymentDate.plus({ month: 1 });
		const nextPaymentDoc = await firestoreAdmin
			.doc<Payment>(
				`${RECIPIENT_FIRESTORE_PATH}/${recipientDoc.id}/${PAYMENT_FIRESTORE_PATH}`,
				nextMonthPaymentDate.toFormat('yyyy-MM'),
			)
			.get();
		expect(nextPaymentDoc.exists).toBeTruthy();
		const nextPayment = nextPaymentDoc.data() as Payment;
		expect(nextPayment.amount).toEqual(700);
		expect(toDateTime(nextPayment.payment_at)).toEqual(nextMonthPaymentDate);
		expect(nextPayment.status).toEqual(PaymentStatus.Created);
		expect(nextPayment.currency).toEqual('SLE');
	}

	const secondExecutionResult = await triggerFunction({
		data: { type: PaymentProcessTaskType.CreatePayments, timestamp: paymentDate.toSeconds() },
		// @ts-ignore
		auth: { token: { email: 'admin@socialincome.org' } },
	});
	expect(secondExecutionResult).toEqual(
		'Set status of 0 payments to paid and created 0 payments for next month. Set status to "former" for 0 recipients and status to active for 0 recipients.',
	);
});

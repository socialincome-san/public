import functions from 'firebase-functions-test';
import { DateTime } from 'luxon';

import { getOrInitializeFirebaseAdmin } from '../../../../../shared/src/firebase/admin/app';
import { FirestoreAdmin } from '../../../../../shared/src/firebase/admin/FirestoreAdmin';
import {
	Payment,
	PAYMENT_FIRESTORE_PATH,
	PaymentProcessTaskType,
	PaymentStatus,
	Recipient,
	RECIPIENT_FIRESTORE_PATH,
	RecipientProgramStatus,
} from '../../../../../shared/src/types';
import { runAdminPaymentProcessTask } from '../../index';

const paymentDate = DateTime.fromSeconds(1681516800); // Exchange rate for this date is stored in seed

describe('AdminPaymentTaskProcessor', () => {
	const projectId = 'test' + new Date().getTime();
	const firestoreAdmin = new FirestoreAdmin(getOrInitializeFirebaseAdmin({ projectId: projectId }));
	const testEnv = functions({ projectId: projectId });
	const triggerFunction = testEnv.wrap(runAdminPaymentProcessTask);

	afterEach(() => testEnv.cleanup());

	test('payment csv', async () => {
		const result = await triggerFunction(
			{ type: PaymentProcessTaskType.GetPaymentCSV, timestamp: paymentDate.toSeconds() },
			{ auth: { token: { email: 'admin@socialincome.org' } } },
		);
		const currentDateAndYear = new Date().toLocaleString('default', { month: 'long' }) + ' ' + new Date().getFullYear();
		const rows = result.split('\n').map((row: string) => row.split(','));

		expect(rows).toHaveLength(4);
		expect(rows[0]).toEqual([
			'Mobile Number*',
			'Amount*',
			'First Name',
			'Last Name',
			'Id Number',
			'Remarks*',
			'User Type*',
		]);
		expect(rows[1]).toEqual([
			'25000300',
			'700',
			'Daniel',
			'Naba',
			'2',
			`Social Income ${currentDateAndYear}`,
			'subscriber',
		]);
		expect(rows[2]).toEqual([
			'25000056',
			'700',
			'Leandro',
			'Pasul',
			'88',
			`Social Income ${currentDateAndYear}`,
			'subscriber',
		]);
		expect(rows[3]).toEqual([
			'25000501',
			'700',
			'Bin',
			'Bun',
			'99',
			`Social Income ${currentDateAndYear}`,
			'subscriber',
		]);
	});

	test('registration csv', async () => {
		const result = await triggerFunction(
			{ type: PaymentProcessTaskType.GetRegistrationCSV, timestamp: paymentDate.toSeconds() },
			{ auth: { token: { email: 'admin@socialincome.org' } } },
		);

		const rows = result.split('\n').map((row: string) => row.split(','));

		expect(rows).toHaveLength(4);
		expect(rows[0]).toEqual(['Mobile Number*', 'Unique Code*', 'User Type*']);
		expect(rows[1]).toEqual(['25000300', '2', 'subscriber']);
		expect(rows[2]).toEqual(['25000056', '88', 'subscriber']);
		expect(rows[3]).toEqual(['25000501', '99', 'subscriber']);
	});

	test('create new payments', async () => {
		const result = await triggerFunction(
			{ type: PaymentProcessTaskType.CreateNewPayments, timestamp: paymentDate.toSeconds() },
			{
				auth: { token: { email: 'admin@socialincome.org' } },
			},
		);
		expect(result).toEqual('Set 3 payments to paid and created 3 payments for next month');

		const recipientDocs = (
			await firestoreAdmin
				.collection<Recipient>(RECIPIENT_FIRESTORE_PATH)
				.where('progr_status', 'in', [RecipientProgramStatus.Active, RecipientProgramStatus.Designated])
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
			expect(payment.amount).toEqual(500);
			expect(DateTime.fromJSDate(payment.payment_at.toDate())).toEqual(paymentDate);
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
			expect(nextPayment.amount).toEqual(500);
			expect(DateTime.fromJSDate(nextPayment.payment_at.toDate())).toEqual(nextMonthPaymentDate);
			expect(nextPayment.status).toEqual(PaymentStatus.Created);
			expect(nextPayment.currency).toEqual('SLE');
		}

		const secondExecutionResult = await triggerFunction(
			{ type: PaymentProcessTaskType.CreateNewPayments, timestamp: paymentDate.toSeconds() },
			{ auth: { token: { email: 'admin@socialincome.org' } } },
		);
		expect(secondExecutionResult).toEqual('Set 0 payments to paid and created 0 payments for next month');
	});
});

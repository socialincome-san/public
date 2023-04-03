import admin from 'firebase-admin';
import functions from 'firebase-functions-test';

import { DateTime } from 'luxon';
import { FirestoreAdmin } from '../../../../shared/src/firebase/FirestoreAdmin';
import {
	AdminPaymentProcessTask,
	Payment,
	PaymentStatus,
	PAYMENT_FIRESTORE_PATH,
	Recipient,
	RecipientProgramStatus,
	RECIPIENT_FIRESTORE_PATH,
} from '../../../../shared/src/types';
import { runAdminPaymentProcessTask } from '../../../src';

describe('AdminPaymentTaskProcessor', () => {
	const projectId = 'test' + new Date().getTime();
	const testEnv = functions({ projectId: projectId });
	const triggerFunction = testEnv.wrap(runAdminPaymentProcessTask);
	const firestoreAdmin = new FirestoreAdmin(admin.app());

	afterEach(() => testEnv.cleanup());

	test('payment csv', async () => {
		const result = await triggerFunction(AdminPaymentProcessTask.GetPaymentCSV, {
			auth: { token: { email: 'admin@socialincome.org' } },
		});
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
			'00000300',
			'500',
			'Daniel',
			'Naba',
			'2',
			`Social Income ${currentDateAndYear}`,
			'subscriber',
		]);
		expect(rows[2]).toEqual([
			'00000056',
			'500',
			'Leandro',
			'Pasul',
			'88',
			`Social Income ${currentDateAndYear}`,
			'subscriber',
		]);
		expect(rows[3]).toEqual([
			'00000501',
			'500',
			'Bin',
			'Bun',
			'99',
			`Social Income ${currentDateAndYear}`,
			'subscriber',
		]);
	});

	test('registration csv', async () => {
		const result = await triggerFunction(AdminPaymentProcessTask.GetRegistrationCSV, {
			auth: { token: { email: 'admin@socialincome.org' } },
		});

		const rows = result.split('\n').map((row: string) => row.split(','));

		expect(rows).toHaveLength(4);
		expect(rows[0]).toEqual(['Mobile Number*', 'Unique Code*', 'User Type*']);
		expect(rows[1]).toEqual(['00000300', '2', 'subscriber']);
		expect(rows[2]).toEqual(['00000056', '88', 'subscriber']);
		expect(rows[3]).toEqual(['00000501', '99', 'subscriber']);
	});

	test('create new payments', async () => {
		const thisMonthPaymentDate = DateTime.fromObject({ day: 15, hour: 0, minute: 0, second: 0, millisecond: 0 });
		const result = await triggerFunction(AdminPaymentProcessTask.CreateNewPayments, {
			auth: { token: { email: 'admin@socialincome.org' } },
		});
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
					thisMonthPaymentDate.toFormat('yyyy-MM')
				)
				.get();
			expect(paymentDoc.exists).toBeTruthy();
			const payment = paymentDoc.data() as Payment;
			expect(payment.amount).toEqual(500);
			expect(DateTime.fromJSDate(payment.payment_at.toDate())).toEqual(thisMonthPaymentDate);
			expect(payment.status).toEqual(PaymentStatus.Paid);
			expect(payment.currency).toEqual('SLE');

			const nextMonthPaymentDate = thisMonthPaymentDate.plus({ month: 1 });
			const nextPaymentDoc = await firestoreAdmin
				.doc<Payment>(
					`${RECIPIENT_FIRESTORE_PATH}/${recipientDoc.id}/${PAYMENT_FIRESTORE_PATH}`,
					nextMonthPaymentDate.toFormat('yyyy-MM')
				)
				.get();
			expect(nextPaymentDoc.exists).toBeTruthy();
			const nextPayment = nextPaymentDoc.data() as Payment;
			expect(nextPayment.amount).toEqual(500);
			expect(DateTime.fromJSDate(nextPayment.payment_at.toDate())).toEqual(nextMonthPaymentDate);
			expect(nextPayment.status).toEqual(PaymentStatus.Created);
			expect(nextPayment.currency).toEqual('SLE');
		}

		const secondExecutionResult = await triggerFunction(AdminPaymentProcessTask.CreateNewPayments, {
			auth: { token: { email: 'admin@socialincome.org' } },
		});
		expect(secondExecutionResult).toEqual('Set 0 payments to paid and created 0 payments for next month');
	});
});

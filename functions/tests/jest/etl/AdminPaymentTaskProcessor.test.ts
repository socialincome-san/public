import { Timestamp } from '@google-cloud/firestore';
import functions from 'firebase-functions-test';
import { AdminPaymentProcessTask, ExchangeRates, Payment, PaymentStatus } from '../../../../shared/src/types';
import { runAdminPaymentProcessTask } from '../../../src';
import { AdminPaymentTaskProcessor } from '../../../src/admin/AdminPaymentTaskProcessor';

describe('AdminPaymentTaskProcessor', () => {
	const projectId = 'test' + new Date().getTime();
	const testEnv = functions({ projectId: projectId });
	const triggerFunction = testEnv.wrap(runAdminPaymentProcessTask);

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
			'25000300',
			'500',
			'Daniel',
			'Naba',
			'2',
			`Social Income ${currentDateAndYear}`,
			'subscriber',
		]);
		expect(rows[2]).toEqual([
			'25000056',
			'500',
			'Leandro',
			'Pasul',
			'88',
			`Social Income ${currentDateAndYear}`,
			'subscriber',
		]);
		expect(rows[3]).toEqual([
			'25000501',
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
		expect(rows[1]).toEqual(['25000300', '2', 'subscriber']);
		expect(rows[2]).toEqual(['25000056', '88', 'subscriber']);
		expect(rows[3]).toEqual(['25000501', '99', 'subscriber']);
	});

	// TODO mkundig investigate flickering
	// test('create new payments', async () => {
	// 	const thisMonthPaymentDate = DateTime.fromObject({ day: 15, hour: 0, minute: 0, second: 0, millisecond: 0 });
	// 	const result = await triggerFunction(AdminPaymentProcessTask.CreateNewPayments, {
	// 		auth: { token: { email: 'admin@socialincome.org' } },
	// 	});
	// 	expect(result).toEqual('Set 3 payments to paid and created 3 payments for next month');
	//
	// 	const recipientDocs = (
	// 		await firestoreAdmin
	// 			.collection<Recipient>(RECIPIENT_FIRESTORE_PATH)
	// 			.where('progr_status', 'in', [RecipientProgramStatus.Active, RecipientProgramStatus.Designated])
	// 			.get()
	// 	).docs;
	// 	expect(recipientDocs).toHaveLength(3);
	//
	// 	for (const recipientDoc of recipientDocs) {
	// 		const paymentDoc = await firestoreAdmin
	// 			.doc<Payment>(
	// 				`${RECIPIENT_FIRESTORE_PATH}/${recipientDoc.id}/${PAYMENT_FIRESTORE_PATH}`,
	// 				thisMonthPaymentDate.toFormat('yyyy-MM')
	// 			)
	// 			.get();
	// 		expect(paymentDoc.exists).toBeTruthy();
	// 		const payment = paymentDoc.data() as Payment;
	// 		expect(payment.amount).toEqual(500);
	// 		expect(DateTime.fromJSDate(payment.payment_at.toDate())).toEqual(thisMonthPaymentDate);
	// 		expect(payment.status).toEqual(PaymentStatus.Paid);
	// 		expect(payment.currency).toEqual('SLE');
	//
	// 		const nextMonthPaymentDate = thisMonthPaymentDate.plus({ month: 1 });
	// 		const nextPaymentDoc = await firestoreAdmin
	// 			.doc<Payment>(
	// 				`${RECIPIENT_FIRESTORE_PATH}/${recipientDoc.id}/${PAYMENT_FIRESTORE_PATH}`,
	// 				nextMonthPaymentDate.toFormat('yyyy-MM')
	// 			)
	// 			.get();
	// 		expect(nextPaymentDoc.exists).toBeTruthy();
	// 		const nextPayment = nextPaymentDoc.data() as Payment;
	// 		expect(nextPayment.amount).toEqual(500);
	// 		expect(DateTime.fromJSDate(nextPayment.payment_at.toDate())).toEqual(nextMonthPaymentDate);
	// 		expect(nextPayment.status).toEqual(PaymentStatus.Created);
	// 		expect(nextPayment.currency).toEqual('SLE');
	// 	}
	//
	// 	const secondExecutionResult = await triggerFunction(AdminPaymentProcessTask.CreateNewPayments, {
	// 		auth: { token: { email: 'admin@socialincome.org' } },
	// 	});
	// 	expect(secondExecutionResult).toEqual('Set 0 payments to paid and created 0 payments for next month');
	// });

	test('calcAmountChf', async () => {
		const exchangeRates: Map<number, ExchangeRates> = new Map([
			[
				1682640000, // 2023-04-28 00:00:00
				{ SLE: 25.0, SLL: 25000 },
			],
		]);
		const paymentSLL: Payment = {
			amount: 500000,
			currency: 'SLL',
			payment_at: Timestamp.fromMillis(1682672487 * 1000), // 2023-04-28 09:01:00
			status: PaymentStatus.Confirmed,
		};

		const paymentSLE: Payment = {
			amount: 500,
			currency: 'SLE',
			payment_at: Timestamp.fromMillis(1682672487 * 1000), // 2023-04-28 09:01:00
			status: PaymentStatus.Confirmed,
		};

		// exact currency match case
		expect(AdminPaymentTaskProcessor.calcAmountChf(exchangeRates, paymentSLL)).toBe(20);
		expect(AdminPaymentTaskProcessor.calcAmountChf(exchangeRates, paymentSLE)).toBe(20);

		// fallback from SLE to SLL exchange rate
		const exchangeRatesWithoutSLE: Map<number, ExchangeRates> = new Map([
			[
				1682640000, // 2023-04-28 00:00:00
				{ SLL: 25000 },
			],
		]);
		expect(AdminPaymentTaskProcessor.calcAmountChf(exchangeRatesWithoutSLE, paymentSLE)).toBe(20);

		// currencies not available
		const exchangeRatesWithoutSLEAndSLL: Map<number, ExchangeRates> = new Map([
			[
				1682640000, // 2023-04-28 00:00:00
				{ XYZ: 25000 },
			],
		]);
		expect(AdminPaymentTaskProcessor.calcAmountChf(exchangeRatesWithoutSLEAndSLL, paymentSLE)).toBe(null);

		// day not available
		const exchangeRatesOtherDate: Map<number, ExchangeRates> = new Map([
			[
				1682553600, // 2023-04-27 00:00:00
				{ SLE: 25.0, SLL: 25000 },
			],
		]);
		expect(AdminPaymentTaskProcessor.calcAmountChf(exchangeRatesOtherDate, paymentSLE)).toBe(null);
		expect(AdminPaymentTaskProcessor.calcAmountChf(exchangeRatesOtherDate, paymentSLL)).toBe(null);
	});
});

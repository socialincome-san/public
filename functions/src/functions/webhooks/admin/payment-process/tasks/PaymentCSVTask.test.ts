import functionsTest from 'firebase-functions-test';
import { DateTime } from 'luxon';
import { PaymentProcessTaskType } from '../../../../../../../shared/src/types/payment';
import { toPaymentDate } from '../../../../../../../shared/src/types/recipient';
import { initializeGlobalTestData } from '../../../../../firebase';
import { webhookPaymentProcessTask } from '../../../index';

const projectId = 'payment-csv-task-test';
const testEnv = functionsTest({ projectId });
const paymentDate = toPaymentDate(DateTime.fromObject({ year: 2023, month: 4, day: 15 }, { zone: 'utc' }));
const triggerFunction = testEnv.wrap(webhookPaymentProcessTask);

beforeEach(async () => {
	await initializeGlobalTestData(projectId);
});

afterEach(async () => {
	await testEnv.firestore.clearFirestoreData({ projectId });
	testEnv.cleanup();
});

test('GetPaymentCSV', async () => {
	const result = await triggerFunction({
		data: { type: PaymentProcessTaskType.GetPaymentCSV, timestamp: paymentDate.toSeconds() },
		// @ts-ignore
		auth: { token: { email: 'admin@socialincome.org' } },
	});

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
	expect(rows[1]).toEqual(['25000052', '700', 'Test2', 'User2', '2', `Social Income April 2023`, 'subscriber']);
	expect(rows[2]).toEqual(['25000053', '700', 'Test3', 'User3', '3', `Social Income April 2023`, 'subscriber']);
	expect(rows[3]).toEqual(['25000054', '700', 'Test4', 'User4', '4', `Social Income April 2023`, 'subscriber']);
});

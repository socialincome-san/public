import functionsTest from 'firebase-functions-test';
import { DateTime } from 'luxon';
import { PaymentProcessTaskType } from '../../../../../../../shared/src/types/payment';
import { toPaymentDate } from '../../../../../../../shared/src/types/recipient';
import { initializeGlobalTestData } from '../../../../../firebase';
import { runPaymentProcessTask } from '../../../index';

const projectId = 'registration-csv-task-test';
const testEnv = functionsTest({ projectId });
const paymentDate = toPaymentDate(DateTime.fromObject({ year: 2023, month: 4, day: 15 }, { zone: 'utc' }));
const triggerFunction = testEnv.wrap(runPaymentProcessTask);

beforeEach(async () => {
	await initializeGlobalTestData(projectId);
});

afterEach(async () => {
	await testEnv.firestore.clearFirestoreData({ projectId });
	testEnv.cleanup();
});

test('GetRegistrationCSV', async () => {
	const result = await triggerFunction({
		data: { type: PaymentProcessTaskType.GetRegistrationCSV, timestamp: paymentDate.toSeconds() },
		// @ts-ignore
		auth: { token: { email: 'admin@socialincome.org' } },
	});

	const rows = result.split('\n').map((row: string) => row.split(','));
	expect(rows).toHaveLength(4);
	expect(rows[0]).toEqual(['Mobile Number*', 'Unique Code*', 'User Type*']);
	expect(rows[1]).toEqual(['25000052', '2', 'subscriber']);
	expect(rows[2]).toEqual(['25000053', '3', 'subscriber']);
	expect(rows[3]).toEqual(['25000054', '4', 'subscriber']);
});

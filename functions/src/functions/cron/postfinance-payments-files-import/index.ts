import { onSchedule } from 'firebase-functions/v2/scheduler';
import { POSTFINANCE_PAYMENTS_FILES_BUCKET } from '../../../config';
import { PostfinancePaymentsFileHandler } from '../../../lib/PostfinancePaymentsFileHandler';

export default onSchedule('0 * * * *', async () => {
	const paymentsFileHandler = new PostfinancePaymentsFileHandler(POSTFINANCE_PAYMENTS_FILES_BUCKET);
	await paymentsFileHandler.importPaymentFiles();
});

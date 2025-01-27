import { onObjectFinalized } from 'firebase-functions/v2/storage';
import { POSTFINANCE_PAYMENTS_FILES_BUCKET } from '../../../config';
import { PostfinancePaymentsFileHandler } from '../../../lib/PostfinancePaymentsFileHandler';

export default onObjectFinalized({ bucket: POSTFINANCE_PAYMENTS_FILES_BUCKET }, async (event) => {
	const paymentsFileHandler = new PostfinancePaymentsFileHandler(POSTFINANCE_PAYMENTS_FILES_BUCKET);
	await paymentsFileHandler.processPaymentFile(event.data.name);
});

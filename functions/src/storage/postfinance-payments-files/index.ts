import { onObjectFinalized } from 'firebase-functions/v2/storage';
import { POSTFINANCE_PAYMENTS_FILES_BUCKET } from '../../config';
import { PostfinancePaymentsFileImporter } from './PostfinancePaymentsFileImporter';

export default onObjectFinalized({ bucket: POSTFINANCE_PAYMENTS_FILES_BUCKET }, async (event) => {
	const paymentsFileImporter = new PostfinancePaymentsFileImporter(POSTFINANCE_PAYMENTS_FILES_BUCKET);
	paymentsFileImporter.processPaymentFile(event.data.name);
});

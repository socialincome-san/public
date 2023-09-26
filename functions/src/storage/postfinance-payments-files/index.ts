import { onObjectFinalized } from 'firebase-functions/v2/storage';
import { PostfinancePaymentsFileImporter } from './PostfinancePaymentsFileImporter';

const BUCKET_NAME = 'postfinance-payments-files';

export default onObjectFinalized({ bucket: BUCKET_NAME }, async (event) => {
	const paymentsFileImporter = new PostfinancePaymentsFileImporter(BUCKET_NAME);
	paymentsFileImporter.processPaymentFile(event.data.name);
});

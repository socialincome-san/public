import { onObjectFinalized } from 'firebase-functions/v2/storage';
import { PostfinancePaymentsFileImporter } from './PostfinancePaymentsFileImporter';

const bucket = 'postfinance-payments-files';
const region = 'europe-west6';

export default onObjectFinalized({ bucket, region }, async (event) => {
	const paymentsFileImporter = new PostfinancePaymentsFileImporter(bucket);
	paymentsFileImporter.processPaymentFile(event.data.name);
});

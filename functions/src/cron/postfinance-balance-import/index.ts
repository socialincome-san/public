import { onSchedule } from 'firebase-functions/v2/scheduler';
import { PostFinanceBalanceImporter } from './PostFinanceBalanceImporter';

/**
 * Function periodically connects to the gmail account where we send the postfinance balance statements,
 * parses the emails and stores the current balances into firestore.
 */
export default onSchedule('0 * * * *', async () => {
	const postFinanceImporter = new PostFinanceBalanceImporter();
	const balances = await postFinanceImporter.retrieveBalanceMails();
	await postFinanceImporter.storeBalances(balances);
});

import * as functions from 'firebase-functions';

import imaps from 'imap-simple';

import { BankBalance, BANK_BALANCE_FIRESTORE_PATH, getIdFromBankBalance } from '@socialincome/shared/src/types';
import _ from 'lodash';
import { simpleParser, Source } from 'mailparser';
import { POSTFINANCE_EMAIL_PASSWORD, POSTFINANCE_EMAIL_USER } from '../config';
import { AbstractFirebaseAdmin, FunctionProvider } from '../firebase';

export class PostFinanceImporter extends AbstractFirebaseAdmin implements FunctionProvider {
	accountRegex = /(?<=account\W)(?<account>.*?)(?=\W)/; // regex to retrieve the account name from the email
	balanceRegex = /balance: CHF (?<balance>[0-9’.]*)/; // regex to retrieve the balance from the email
	// we retrieve only unseen mails and mark them as seen once we imported the balance
	searchCriteria = ['UNSEEN'];
	fetchOptions = { bodies: ['HEADER', 'TEXT', ''], markSeen: true };

	/**
	 * Function periodically connects to the gmail account where we send the postfinance balance statements,
	 * parses the emails and stores the current balances into firestore.
	 */
	getFunction() {
		return functions.pubsub.schedule('0 * * * *').onRun(async () => {
			const balances = await this.retrieveBalanceMails();
			await this.storeBalances(balances);
		});
	}

	extractBalance = (html: String) => {
		return Number.parseFloat(html.match(this.balanceRegex)!.groups!['balance'].replace('’', ''));
	};

	storeBalances = async (balances: BankBalance[]): Promise<void> => {
		for await (const balance of balances) {
			await this.firestoreAdmin
				.doc<BankBalance>(BANK_BALANCE_FIRESTORE_PATH, getIdFromBankBalance(balance))
				.set(balance);
		}
	};

	extractAccount = (html: String) => {
		return html.match(this.accountRegex)!.groups!['account'].toLowerCase();
	};

	retrieveBalanceMails = async (): Promise<BankBalance[]> => {
		try {
			functions.logger.info('Start checking balance inbox');
			const config = {
				imap: {
					user: POSTFINANCE_EMAIL_USER,
					password: POSTFINANCE_EMAIL_PASSWORD,
					host: 'imap.gmail.com',
					port: 993,
					tls: true,
					tlsOptions: { rejectUnauthorized: false },
					authTimeout: 10000,
				},
			};
			const connection = await imaps.connect(config);
			await connection.openBox('INBOX');
			functions.logger.info('Connected to inbox');
			const messages = await connection.search(this.searchCriteria, this.fetchOptions);
			const balances = await Promise.all(
				messages.map(async (item: any) => {
					const all = _.find(item.parts, { which: '' });
					const id = item.attributes.uid;
					const idHeader = 'Imap-Id: ' + id + '\r\n';
					const source = idHeader + all?.body;
					return this.parseEmail(source);
				})
			);
			connection.end();
			functions.logger.info('Retrieved balances');
			return balances.flat();
		} catch (error) {
			functions.logger.error('Could not ingest balance mails', error);
			return [];
		}
	};

	parseEmail = async (source: Source): Promise<BankBalance[]> => {
		const mail = await simpleParser(source);
		if (!mail || !mail.html) return [];
		try {
			return [
				{
					timestamp: mail.date!.getTime() / 1000,
					account: this.extractAccount(mail.html),
					balance: this.extractBalance(mail.html),
					currency: 'CHF',
				} as BankBalance,
			];
		} catch {
			functions.logger.info(`Could not parse email with subject ${mail.subject}`);
			return [];
		}
	};
}

import { logger } from 'firebase-functions';
import imaps from 'imap-simple';
import _ from 'lodash';
import { Source, simpleParser } from 'mailparser';
import { FirestoreAdmin } from '@socialincome/shared/src/firebase/admin/FirestoreAdmin';
import {
	BANK_BALANCE_FIRESTORE_PATH,
	BankBalance,
	getIdFromBankBalance,
} from '@socialincome/shared/src/types/BankBalance';
import { POSTFINANCE_EMAIL_PASSWORD, POSTFINANCE_EMAIL_USER } from '../../config';

export class PostFinanceBalanceImporter {
	private readonly accountRegex = /(?<=account\W)(?<account>.*?)(?=\W)/; // regex to retrieve the account name from the email
	private readonly balanceRegex = /balance: CHF (?<balance>[0-9’.]*)/; // regex to retrieve the balance from the email
	// we retrieve only unseen mails and mark them as seen once we imported the balance
	private readonly searchCriteria = ['UNSEEN'];
	private readonly fetchOptions = { bodies: ['HEADER', 'TEXT', ''], markSeen: true };
	private readonly firestoreAdmin: FirestoreAdmin;

	constructor() {
		this.firestoreAdmin = new FirestoreAdmin();
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
			logger.info('Start checking balance inbox');
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
			logger.info('Connected to inbox');
			const messages = await connection.search(this.searchCriteria, this.fetchOptions);
			const balances = await Promise.all(
				messages.map(async (item: any) => {
					const all = _.find(item.parts, { which: '' });
					const id = item.attributes.uid;
					const idHeader = 'Imap-Id: ' + id + '\r\n';
					const source = idHeader + all?.body;
					return this.parseEmail(source);
				}),
			);
			connection.end();
			logger.info('Retrieved balances');
			return balances.flat();
		} catch (error) {
			logger.error('Could not ingest balance mails', error);
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
			logger.info(`Could not parse email with subject ${mail.subject}`);
			return [];
		}
	};
}

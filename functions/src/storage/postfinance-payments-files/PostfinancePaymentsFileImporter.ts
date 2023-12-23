import xmldom from '@xmldom/xmldom';
import { DateTime } from 'luxon';
import xpath from 'xpath';
import { FirestoreAdmin } from '../../../../shared/src/firebase/admin/FirestoreAdmin';
import { StorageAdmin } from '../../../../shared/src/firebase/admin/StorageAdmin';
import { toFirebaseAdminTimestamp } from '../../../../shared/src/firebase/admin/utils';
import {
	BankWireContribution,
	CONTRIBUTION_FIRESTORE_PATH,
	ContributionSourceKey,
	StatusKey,
} from '../../../../shared/src/types/contribution';
import { Currency } from '../../../../shared/src/types/currency';
import { USER_FIRESTORE_PATH, User } from '../../../../shared/src/types/user';

// TODO: write tests
export class PostfinancePaymentsFileImporter {
	private storageAdmin: StorageAdmin;
	private firestoreAdmin: FirestoreAdmin;
	private bucketName;

	private readonly xmlSelectExpression = '//ns:BkToCstmrDbtCdtNtfctn/ns:Ntfctn/ns:Ntry/ns:NtryDtls/ns:TxDtls';

	constructor(bucketName: string) {
		this.storageAdmin = new StorageAdmin();
		this.firestoreAdmin = new FirestoreAdmin();
		this.bucketName = bucketName;
	}

	processPaymentFile(fileName: string) {
		this.storageAdmin.storage
			.bucket(this.bucketName)
			.file(fileName)
			.download()
			.then(async (data) => {
				const xmlString = data[0].toString('utf8');
				const xmlDoc = new xmldom.DOMParser().parseFromString(xmlString, 'text/xml');
				const select = xpath.useNamespaces({ ns: 'urn:iso:std:iso:20022:tech:xsd:camt.054.001.04' });
				const nodes = select(this.xmlSelectExpression, xmlDoc) as Node[];

				for (let node of nodes) {
					const contribution: BankWireContribution = {
						reference_id: parseFloat(select('string(//ns:Refs/ns:AcctSvcrRef)', node) as string),
						currency: (select('string(//ns:Amt/@Ccy)', node) as string).toUpperCase() as Currency,
						amount: parseFloat(select('string(//ns:Amt)', node) as string),
						amount_chf: parseFloat(select('string(//ns:Amt)', node) as string),
						fees_chf: 0,
						status: StatusKey.SUCCEEDED,
						created: toFirebaseAdminTimestamp(DateTime.now()),
						source: ContributionSourceKey.WIRE_TRANSFER,
						raw_content: node.toString(),
					};

					const user = await this.firestoreAdmin.findFirst<User>(USER_FIRESTORE_PATH, (q) =>
						q.where('paymentReferenceId', '==', contribution.reference_id),
					);

					if (user) {
						await user?.ref
							.collection('subscriptions')
							.doc('wire-transfer-01')
							.collection(CONTRIBUTION_FIRESTORE_PATH)
							.add(contribution);
					} else {
						await this.firestoreAdmin.collection(CONTRIBUTION_FIRESTORE_PATH).add(contribution);
					}
				}
			});
	}
}

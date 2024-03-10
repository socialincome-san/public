import xmldom from '@xmldom/xmldom';
import { DateTime } from 'luxon';
import SFTPClient from 'ssh2-sftp-client';
import { withFile } from 'tmp-promise';
import xpath from 'xpath';
import { FirestoreAdmin } from '../../../shared/src/firebase/admin/FirestoreAdmin';
import { StorageAdmin } from '../../../shared/src/firebase/admin/StorageAdmin';
import { toFirebaseAdminTimestamp } from '../../../shared/src/firebase/admin/utils';
import {
	BankWireContribution,
	CONTRIBUTION_FIRESTORE_PATH,
	ContributionSourceKey,
	StatusKey,
} from '../../../shared/src/types/contribution';
import { Currency } from '../../../shared/src/types/currency';
import { USER_FIRESTORE_PATH, User } from '../../../shared/src/types/user';
import {
	POSTFINANCE_FTP_HOST,
	POSTFINANCE_FTP_PORT,
	POSTFINANCE_FTP_RSA_PRIVATE_KEY_BASE64,
	POSTFINANCE_FTP_USER,
} from '../config';

export class PostfinancePaymentsFileHandler {
	private storageAdmin: StorageAdmin;
	private firestoreAdmin: FirestoreAdmin;
	private readonly bucketName;
	private readonly xmlSelectExpression = '//ns:BkToCstmrDbtCdtNtfctn/ns:Ntfctn/ns:Ntry/ns:NtryDtls/ns:TxDtls';

	constructor(bucketName: string) {
		this.storageAdmin = new StorageAdmin();
		this.firestoreAdmin = new FirestoreAdmin();
		this.bucketName = bucketName;
	}

	/**
	 * Imports payment files from the Postfinance SFTP server to the payments files storage bucket
	 */
	async importPaymentFiles() {
		const sftp = new SFTPClient();
		const bucket = this.storageAdmin.storage.bucket(this.bucketName);
		const files = (await bucket.getFiles())[0].map((file) => file.name);

		await sftp.connect({
			host: POSTFINANCE_FTP_HOST,
			port: Number(POSTFINANCE_FTP_PORT),
			username: POSTFINANCE_FTP_USER,
			privateKey: atob(POSTFINANCE_FTP_RSA_PRIVATE_KEY_BASE64),
		});
		const sftpFiles = await sftp.list('/yellow-net-reports');
		for (let file of sftpFiles) {
			if (files.includes(file.name)) {
				console.info(`Skipped copying file ${file.name} because it already exists in ${this.bucketName} bucket`);
				continue;
			}

			await withFile(async ({ path }) => {
				await sftp.get(`/yellow-net-reports/${file.name}`, path);
				await this.storageAdmin.uploadFile({
					bucket: bucket,
					sourceFilePath: path,
					destinationFilePath: file.name,
				});
				console.info(`Successfully copied ${file.name} to ${this.bucketName} bucket`);
			});
		}
	}

	/**
	 * Processes a payment file from the payments files storage bucket
	 * @param fileName The name of the file to process
	 */
	processPaymentFile(fileName: string) {
		if (!fileName.startsWith('camt.054_P_')) {
			console.info(`Skipped processing ${fileName} because it does not contain relevant payment data`);
			return;
		}

		this.storageAdmin.storage
			.bucket(this.bucketName)
			.file(fileName)
			.download()
			.then(async (data) => {
				const xmlString = data[0].toString('utf8');
				const xmlDoc = new xmldom.DOMParser().parseFromString(xmlString, 'text/xml');
				const select = xpath.useNamespaces({ ns: 'urn:iso:std:iso:20022:tech:xsd:camt.054.001.08' });
				const nodes = select(this.xmlSelectExpression, xmlDoc) as Node[];

				for (let node of nodes) {
					const transactionId = select('string(//ns:Refs/ns:EndToEndId)', node) as string;
					const referenceId = select('string(//ns:RmtInf/ns:Strd/ns:CdtrRefInf/ns:Ref)', node) as string;
					const userReferenceId = parseInt(referenceId.slice(7, 20));
					console.info(
						`Processing transaction ${transactionId} with reference ${referenceId} for user ${userReferenceId}`,
					);

					const contribution: BankWireContribution = {
						reference_id: referenceId,
						transaction_id: transactionId,
						monthly_interval: parseInt(referenceId.slice(20, 22)),
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
						q.where('payment_reference_id', '==', userReferenceId),
					);

					if (user) {
						await user?.ref.collection(CONTRIBUTION_FIRESTORE_PATH).doc(transactionId).set(contribution);
					} else {
						await this.firestoreAdmin.collection(CONTRIBUTION_FIRESTORE_PATH).doc(transactionId).set(contribution);
					}
				}
			});
	}
}

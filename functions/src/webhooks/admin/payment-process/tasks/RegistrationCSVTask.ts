import { QueryDocumentSnapshot } from '@google-cloud/firestore';
import { Recipient } from '../../../../../../shared/src/types';

export class RegistrationCSVTask {
	private readonly recipients: QueryDocumentSnapshot<Recipient>[];

	constructor(recipients: QueryDocumentSnapshot<Recipient>[]) {
		this.recipients = recipients;
	}

	async run(): Promise<string> {
		const csvRows = [['Mobile Number*', 'Unique Code*', 'User Type*']];
		for (const recipient of this.recipients) {
			csvRows.push([
				recipient.get('mobile_money_phone').phone.toString().slice(-8),
				recipient.get('om_uid').toString(),
				'subscriber',
			]);
		}
		return csvRows.map((row) => row.join(',')).join('\n');
	}
}

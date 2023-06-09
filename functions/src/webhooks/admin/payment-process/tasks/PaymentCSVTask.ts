import { QueryDocumentSnapshot } from '@google-cloud/firestore';

import { PAYMENT_AMOUNT, Recipient } from '@socialincome/shared/src/types';

export class PaymentCSVTask {
	private readonly recipients: QueryDocumentSnapshot<Recipient>[];

	constructor(recipients: QueryDocumentSnapshot<Recipient>[]) {
		this.recipients = recipients;
	}

	async run(): Promise<string> {
		const date = new Date();
		const csvRows = [['Mobile Number*', 'Amount*', 'First Name', 'Last Name', 'Id Number', 'Remarks*', 'User Type*']];

		for (const recipient of this.recipients) {
			csvRows.push([
				recipient.get('mobile_money_phone').phone.toString().slice(-8),
				PAYMENT_AMOUNT.toString(),
				recipient.get('first_name'),
				recipient.get('last_name'),
				recipient.get('om_uid').toString(),
				`Social Income ${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`,
				'subscriber',
			]);
		}
		return csvRows.map((row) => row.join(',')).join('\n');
	}
}

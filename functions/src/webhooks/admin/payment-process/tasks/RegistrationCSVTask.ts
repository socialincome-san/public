import { PaymentTask } from './PaymentTask';

export class RegistrationCSVTask extends PaymentTask {
	async run(): Promise<string> {
		const csvRows = [['Mobile Number*', 'Unique Code*', 'User Type*']];
		const recipients = await this.getRecipients();
		recipients.sort((a, b) => a.get('om_uid') - b.get('om_uid'));

		for (const recipient of recipients) {
			csvRows.push([
				recipient.get('mobile_money_phone').phone.toString().slice(-8),
				recipient.get('om_uid').toString(),
				'subscriber',
			]);
		}
		return csvRows.map((row) => row.join(',')).join('\n');
	}
}

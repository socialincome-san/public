import { DateTime } from 'luxon';
import { PAYMENT_AMOUNT_SLE } from '../../../../../../shared/src/types/payment';
import { PaymentTask } from './PaymentTask';

export class PaymentCSVTask extends PaymentTask {
	async run(paymentDate: DateTime): Promise<string> {
		const csvRows = [['Mobile Number*', 'Amount*', 'First Name', 'Last Name', 'Id Number', 'Remarks*', 'User Type*']];
		const recipients = await this.getRecipients();
		recipients.sort((a, b) => a.get('om_uid') - b.get('om_uid'));

		await Promise.all(
			recipients.map(async (recipient) => {
				csvRows.push([
					recipient.get('mobile_money_phone').phone.toString().slice(-8),
					PAYMENT_AMOUNT_SLE.toString(),
					recipient.get('first_name'),
					recipient.get('last_name'),
					recipient.get('om_uid').toString(),
					`Social Income ${paymentDate.toFormat('LLLL yyyy')}`,
					'subscriber',
				]);
			}),
		);
		return csvRows.map((row) => row.join(',')).join('\n');
	}
}

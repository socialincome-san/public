import * as functions from 'firebase-functions';
import { DateTime } from 'luxon';
import { PAYMENTS_COUNT, RecipientProgramStatus } from '../../../../../../shared/src/types';
import { PaymentTask } from './PaymentTask';

export class UpdateRecipientsTask extends PaymentTask {
	async run(paymentDate: DateTime): Promise<string> {
		let [setToActiveCount, setToFormerCount] = [0, 0];
		const recipients = await this.getRecipients([RecipientProgramStatus.Active, RecipientProgramStatus.Designated]);

		// If a recipient has status designated, update si_start_date to the payment date and set the status to active
		for (const recipient of recipients) {
			if (recipient.get('progr_status') === RecipientProgramStatus.Designated) {
				if (!recipient.get('om_uid'))
					throw new functions.https.HttpsError('internal', 'Orange Money Id missing for designated recipient');
				await recipient.ref.update({
					si_start_date: paymentDate.toJSDate(),
					progr_status: RecipientProgramStatus.Active,
				});
				setToActiveCount++;
			}

			const paymentsCount = (await recipient.ref.collection('payments').count().get()).data()['count'];
			if (paymentsCount == PAYMENTS_COUNT) {
				// If a recipient has received all their payments, set their status to former
				await recipient.ref.update({
					progr_status: RecipientProgramStatus.Former,
				});
				setToFormerCount++;
			}
		}

		return `Set status of ${setToActiveCount} recipients to active and ${setToFormerCount} recipients to former`;
	}
}

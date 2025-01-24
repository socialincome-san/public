import { logger } from 'firebase-functions';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { DateTime } from 'luxon';
import { FirestoreAdmin } from '../../../../../shared/src/firebase/admin/FirestoreAdmin';
import { toFirebaseAdminTimestamp } from '../../../../../shared/src/firebase/admin/utils';
import {
	FirstPayoutEmailTemplateData,
	SendgridMailClient,
} from '../../../../../shared/src/sendgrid/SendgridMailClient';
import { Contribution, CONTRIBUTION_FIRESTORE_PATH } from '../../../../../shared/src/types/contribution';
import { LanguageCode } from '../../../../../shared/src/types/language';
import { User, USER_FIRESTORE_PATH } from '../../../../../shared/src/types/user';
import { toDateTime } from '../../../../../shared/src/utils/date';

const getFirstPayoutEmailReceivers = async (
	firestoreAdmin: FirestoreAdmin,
	from: DateTime,
	to: DateTime,
): Promise<
	{
		email: string;
		language: LanguageCode;
		templateData: FirstPayoutEmailTemplateData;
	}[]
> => {
	const users = await firestoreAdmin.collection<User>(USER_FIRESTORE_PATH).get();
	return (
		await Promise.all(
			users.docs
				.filter((userDoc) => !userDoc.get('test_user'))
				.map(async (userDoc) => {
					const user = userDoc.data();
					const firstContribution = await firestoreAdmin
						.collection(`${USER_FIRESTORE_PATH}/${userDoc.id}/${CONTRIBUTION_FIRESTORE_PATH}`)
						.orderBy('created', 'asc')
						.limit(1)
						.get();

					if (firstContribution.empty) return [];
					const contribution = firstContribution.docs[0].data() as Contribution;
					if (!contribution) return [];
					console.log('from', from, typeof from);
					console.log('firestoreTimestamp', toFirebaseAdminTimestamp(from));
					if (
						contribution.created >= toFirebaseAdminTimestamp(from) &&
						contribution.created < toFirebaseAdminTimestamp(to)
					) {
						return [
							{
								email: user.email,
								language: user.language || 'en',
								templateData: {
									first_name: user.personal?.name,
									donation_amount: contribution.amount,
									currency: contribution.currency,
									n_days_ago: Math.abs(Math.round(toDateTime(contribution.created).diffNow('days').days)),
									donation_amount_sm: Math.max(5, Math.floor(contribution.amount / 50) * 5),
									donation_amount_md: Math.max(10, Math.ceil(contribution.amount / 40) * 5),
									one_time_donation: contribution.monthly_interval === 0,
								},
							},
						];
					}
					return [];
				}),
		)
	).flat();
};

export async function sendFirstPayoutEmail() {
	let message = '';
	const sendgridClient = new SendgridMailClient(process.env.SENDGRID_API_KEY!);
	try {
		const firestoreAdmin = new FirestoreAdmin();
		const now = DateTime.now();
		const fromDate = now.minus({ months: 1 }).set({ day: 16, hour: 0, minute: 0, second: 0, millisecond: 0 });
		const toDate = now.set({ day: 16, hour: 0, minute: 0, second: 0, millisecond: 0 });
		const firstPayoutEmailReceivers = await getFirstPayoutEmailReceivers(firestoreAdmin, fromDate, toDate);

		await Promise.all(
			firstPayoutEmailReceivers.map(async ({ email, language, templateData }) => {
				await sendgridClient.sendFirstPayoutEmail(email, language, templateData);
			}),
		);
		message = `Successfully sent first payout emails to ${firstPayoutEmailReceivers.length} users`;
		logger.info(message);
	} catch (error) {
		message = `Failed to send first payout emails: ${error}`;
		logger.error(message);
	} finally {
		sendgridClient.send({
			to: 'dev@socialincome.org',
			from: 'hello@socialincome.org',
			subject: 'First payout email cron job',
			text: message,
		});
	}
}

// Run on the 16th of every month at 15:00 UTC
export default onSchedule({ schedule: '0 15 16 * *', memory: '2GiB' }, async () => {
	await sendFirstPayoutEmail();
	logger.info('First payout email cron job finished');
});

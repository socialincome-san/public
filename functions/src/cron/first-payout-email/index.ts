import { FirestoreAdmin } from '@socialincome/shared/src/firebase/admin/FirestoreAdmin';
import { toFirebaseAdminTimestamp } from '@socialincome/shared/src/firebase/admin/utils';
import { Contribution, CONTRIBUTION_FIRESTORE_PATH } from '@socialincome/shared/src/types/contribution';
import { LanguageCode } from '@socialincome/shared/src/types/language';
import { User, USER_FIRESTORE_PATH } from '@socialincome/shared/src/types/user';
import { toDateTime } from '@socialincome/shared/src/utils/date';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { DateTime } from 'luxon';
import { FirstPayoutEmailTemplateData, SendgridMailClient } from '../../../../shared/src/sendgrid/SendgridMailClient';

export const getFirstPayoutEmailReceivers = async (
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

// Run on the 16th of every month at 00:00
export default onSchedule('0 0 16 * *', async () => {
	const sendgridClient = new SendgridMailClient(process.env.SENDGRID_API_KEY!);
	const firestoreAdmin = new FirestoreAdmin();

	const now = DateTime.now();
	const fromDate = DateTime.fromObject({ year: now.year, month: now.month - 1, day: 16, hour: 0 }, { zone: 'utc' });
	const toDate = DateTime.fromObject({ year: now.year, month: now.month, day: 16, hour: 0 }, { zone: 'utc' });
	const firstPayoutEmailReceivers = await getFirstPayoutEmailReceivers(firestoreAdmin, fromDate, toDate);

	await Promise.all(
		firstPayoutEmailReceivers.map(async (entry) => {
			const { email, language, templateData } = entry;
			await sendgridClient.sendFirstPayoutEmail(email, language, templateData);
		}),
	);
});

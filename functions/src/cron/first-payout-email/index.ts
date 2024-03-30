import { MailService } from '@sendgrid/mail';
import { FirestoreAdmin } from '@socialincome/shared/src/firebase/admin/FirestoreAdmin';
import { toFirebaseAdminTimestamp } from '@socialincome/shared/src/firebase/admin/utils';
import { Contribution, CONTRIBUTION_FIRESTORE_PATH } from '@socialincome/shared/src/types/contribution';
import { User, USER_FIRESTORE_PATH } from '@socialincome/shared/src/types/user';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { DateTime } from 'luxon';

// Run on the 16th of every month at 00:00
export default onSchedule('0 0 16 * *', async () => {
	const sendgridClient = new MailService();
	sendgridClient.setApiKey(process.env.SENDGRID_API_KEY!);

	const firestoreAdmin = new FirestoreAdmin();

	const now = DateTime.now();
	const fromDate = DateTime.fromObject({ year: now.year, month: now.month - 1, day: 16, hour: 0 }, { zone: 'utc' });
	const toDate = DateTime.fromObject({ year: now.year, month: now.month, day: 16, hour: 0 }, { zone: 'utc' });

	const users = await firestoreAdmin.collection<User>(USER_FIRESTORE_PATH).get();
	const templateDocs = await Promise.all(
		users.docs
			.filter((userDoc) => !userDoc.get('test_user'))
			.flatMap(async (userDoc) => {
				const user = userDoc.data();
				const contributionDoc = await firestoreAdmin.findFirst<Contribution>(
					`${USER_FIRESTORE_PATH}/${userDoc.id}/${CONTRIBUTION_FIRESTORE_PATH}`,
					(query) =>
						query
							.where('created', '>=', toFirebaseAdminTimestamp(fromDate))
							.where('created', '<', toFirebaseAdminTimestamp(toDate)),
				);
				const contribution = contributionDoc?.data();

				if (contribution) {
					return {
						first_name: user.personal?.name,
						email: user.email,
						donation_amount: contribution.amount,
						currency: contribution.currency,
					};
				}
				return {};
			}),
	);

	await Promise.all(
		templateDocs.map(async (doc) => {
			const { email, ...rest } = doc;
			await sendgridClient.send({
				to: doc.email,
				from: 'hello@socialincome.org',
				templateId: 'd-4e616d721b0240509f468c1e5ff22e6d',
				dynamicTemplateData: rest,
			});
		}),
	);
});

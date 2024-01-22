import { onCall } from 'firebase-functions/v2/https';
import { withFile } from 'tmp-promise';
import { FirestoreAdmin } from '../../../../../shared/src/firebase/admin/FirestoreAdmin';
import { StorageAdmin } from '../../../../../shared/src/firebase/admin/StorageAdmin';
import {
	DONATION_CERTIFICATE_FIRESTORE_PATH,
	DonationCertificate,
} from '../../../../../shared/src/types/donation-certificate';
import { USER_FIRESTORE_PATH } from '../../../../../shared/src/types/user';
import { DonationCertificateWriter } from './DonationCertificateWriter';

export interface CreateDonationCertificatesFunctionProps {
	year: number;
	userIds: string[];
	createAll: boolean; // if true, certificates for all CH users are created
}

export default onCall<CreateDonationCertificatesFunctionProps, Promise<string>>({ memory: '4GiB' }, async (request) => {
	const firestoreAdmin = new FirestoreAdmin();
	await firestoreAdmin.assertGlobalAdmin(request.auth?.token?.email);
	const storageAdmin = new StorageAdmin();
	let [successCount, usersWithFailures] = [0, [] as string[]];

	let userIds: string[];
	if (request.data.createAll) {
		userIds = (
			await firestoreAdmin
				.collection(USER_FIRESTORE_PATH)
				.where('address.country', '==', 'CH')
				.where('address.street', '!=', null)
				.select()
				.get()
		).docs.map((doc) => doc.id);
	} else {
		userIds = request.data.userIds;
	}

	await Promise.all(
		userIds.map(async (userId) => {
			try {
				const writer = await DonationCertificateWriter.getInstance(userId, request.data.year);
				if (writer.contributionsByCurrency.size() === 0) {
					console.info(`No contributions found for user ${userId}`);
					return;
				}

				await withFile(async ({ path }) => {
					await writer.writeDonationCertificatePDF(path);

					const { downloadUrl } = await storageAdmin.uploadAndGetDownloadURL({
						sourceFilePath: path,
						destinationFilePath: `users/${userId}/donation-certificates/${writer.year}_${writer.user.language}.pdf`,
					});

					await firestoreAdmin
						.collection(`${USER_FIRESTORE_PATH}/${userId}/${DONATION_CERTIFICATE_FIRESTORE_PATH}`)
						.doc(`${writer.year}-${writer.user.address?.country}`)
						.set(
							{ year: writer.year, country: writer.user.address?.country, url: downloadUrl } as DonationCertificate,
							{
								merge: true,
							},
						);
					console.info(`Donation certificate document written for user ${userId}`);
					successCount += 1;

					// if (request.data.sendEmails) {
					// await sendEmail({
					// 	to: user.email,
					// 	subject: translator.t('email-subject'),
					// 	// TODO: Use renderEmailTemplate() instead of renderTemplate()
					// 	content: await renderTemplate({
					// 		language: user.language || 'de',
					// 		translationNamespace: 'donation-certificate',
					// 		hbsTemplatePath: 'email/donation-certificate.hbs',
					// 		context: {
					// 			title: translator.t('title', { context: { year } }),
					// 			signature: translator.t('title', { context: { year } }),
					// 			firstname: user.personal?.name,
					// 			year: year,
					// 		},
					// 	}),
					// 	attachments: [
					// 		{
					// 			filename: translator.t('filename', { context: { year } }),
					// 			path: path,
					// 		},
					// 	],
					// 	from: NOTIFICATION_EMAIL_USER_KERRIN,
					// 	user: NOTIFICATION_EMAIL_USER_KERRIN,
					// 	password: NOTIFICATION_EMAIL_PASSWORD_KERRIN,
					// });
					// }
				});
			} catch (e) {
				usersWithFailures.push(userId);
				console.error(e);
			}
		}),
	);
	return `Successfully created ${successCount} donation certificates for ${request.data.year} 
	Users with errors (${usersWithFailures.length}): ${usersWithFailures.join(',')}`;
});

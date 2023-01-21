import { StorageAdmin } from '@socialincome/shared/src/firebase/StorageAdmin';
import * as functions from 'firebase-functions';
import * as fs from 'fs';
import handlebars from 'handlebars';
import { withFile } from 'tmp-promise';
import { FirestoreAdmin } from '../../../shared/src/firebase/FirestoreAdmin';
import { DonationCertificate, Entity, User } from '../../../shared/src/types';
import { sendEmail } from '../../../shared/src/utils/messaging/email';
import { NOTIFICATION_EMAIL_PASSWORD, NOTIFICATION_EMAIL_USER } from '../config';
import { generateDonationCertificatePDF } from './generatePDF';
import { getEmailTemplate, loadLocales } from './locales';

export interface CreateDonationCertificatesFunctionProps {
	users: Entity<User>[];
	year: number;
	sendEmails: boolean;
}

export class DonationCertificateHandler {
	readonly firestoreAdmin: FirestoreAdmin;
	readonly storageAdmin: StorageAdmin;

	constructor(firestoreAdmin: FirestoreAdmin, storageAdmin: StorageAdmin) {
		this.firestoreAdmin = firestoreAdmin;
		this.storageAdmin = storageAdmin;
	}

	createDonationCertificates = functions.https.onCall(
		async ({ users, year, sendEmails }: CreateDonationCertificatesFunctionProps, { auth }) => {
			await this.firestoreAdmin.assertGlobalAdmin(auth?.token?.email);

			let [successCount, skippedCount] = [0, 0];
			for (const userEntity of users) {
				const user = userEntity.values;
				try {
					await withFile(async ({ path }) => {
						if (!user.location) throw new Error('User location missing');

						let locales = loadLocales(user.language);
						await generateDonationCertificatePDF(this.firestoreAdmin, userEntity, year, path, locales);
						const { downloadUrl } = await this.storageAdmin.uploadAndGetDownloadURL({
							sourceFilePath: path,
							destinationFilePath: `donation-certificates/${userEntity.id}/${year}_${userEntity.values.location}.pdf`,
						});
						this.storeDonationCertificate(userEntity.id, {
							url: downloadUrl,
							country: user.location,
							year: year,
						});
						if (sendEmails) {
							const emailTemplate = getEmailTemplate(user.language);
							await sendEmail({
								to: user.email,
								subject: locales['email-subject'],
								content: handlebars.compile(fs.readFileSync(emailTemplate, 'utf-8'))({
									firstname: user.personal?.name,
									year,
								}),
								attachments: [
									{
										filename: locales['filename-prefix'] + year + '.pdf',
										path: path,
									},
								],
								user: NOTIFICATION_EMAIL_USER,
								password: NOTIFICATION_EMAIL_PASSWORD,
							});
						}
					});
					successCount += 1;
				} catch (e) {
					skippedCount += 1;
					console.error(e);
				}
			}
			return `Successfully created ${successCount} donation certificates for ${year} (${skippedCount} skipped)`;
		}
	);

	storeDonationCertificate = (userId: string, donationCertificate: DonationCertificate) => {
		this.firestoreAdmin
			.collection(`users/${userId}/donation-certificate`)
			.doc(`${donationCertificate.year}-${donationCertificate.country}`)
			.set(donationCertificate, { merge: true })
			.then(() => console.log(`Donation certificate document written for user ${userId}`));
	};
}

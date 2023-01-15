import { StorageAdmin } from '@socialincome/shared/src/firebase/StorageAdmin';
import * as functions from 'firebase-functions';
import { withFile } from 'tmp-promise';
import { FirestoreAdmin } from '../../../shared/src/firebase/firestoreAdmin';
import { DonationCertificate, Entity, User } from '../../../shared/src/types';
import { generateDonationCertificatePDF } from './generatePDF';
import { loadLocales } from './locales';
import { sendDonationCertificateEmail } from './sendEmail';

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
						await generateDonationCertificatePDF(userEntity, year, path, locales);
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
							await sendDonationCertificateEmail(user, year, path, locales);
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

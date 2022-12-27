import assert from 'assert';
import * as functions from 'firebase-functions';
import { withFile } from 'tmp-promise';
import { doc, useFirestore } from '../../../shared/src/firebase/firestoreAdmin';
import { uploadAndGetDownloadURL } from '../../../shared/src/firebase/storageAdmin';
import { AdminUser, DonationCertificate, Entity, User } from '../../../shared/src/types';
import { generateDonationCertificatePDF } from './generatePDF';
import { loadLocales } from './locales';
import { sendDonationCertificateEmail } from './sendEmail';

export interface CreateDonationCertificatesFunctionProps {
	users: Entity<User>[];
	year: number;
	sendEmails: boolean;
}

// TODO: make sure only admins or certain users are allowed to call this function!
export const createDonationCertificatesFunction = functions.https.onCall(
	async ({ users, year, sendEmails }: CreateDonationCertificatesFunctionProps, { auth }) => {
		const admin = (await doc<AdminUser>('admins', auth?.token?.email || '').get()).data();
		assert(admin?.is_global_admin);

		let [successCount, skippedCount] = [0, 0];
		for (const userEntity of users) {
			const user = userEntity.values;
			try {
				await withFile(async ({ path }) => {
					if (!user.location) throw new Error('User location missing');

					let locales = loadLocales(user.language);
					await generateDonationCertificatePDF(userEntity, year, path, locales);
					const { downloadUrl } = await uploadAndGetDownloadURL({
						sourceFilePath: path,
						destinationFilePath: `donation-certificates/${userEntity.id}/${year}_${userEntity.values.location}.pdf`,
					});
					storeDonationCertificate(userEntity.id, {
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

export const storeDonationCertificate = (userId: string, donationCertificate: DonationCertificate) => {
	const firestore = useFirestore();
	firestore
		.collection(`users/${userId}/donation-certificate`)
		.doc(`${donationCertificate.year}-${donationCertificate.country}`)
		.set(donationCertificate, { merge: true })
		.then(() => console.log(`Donation certificate document written for user ${userId}`));
};

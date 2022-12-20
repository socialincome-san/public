import * as functions from 'firebase-functions';
import { withFile } from 'tmp-promise';
import { useFirestore } from '../../../shared/src/firebase/firestoreAdmin';
import { uploadAndGetDownloadURL } from '../../../shared/src/firebase/storageAdmin';
import { DonationCertificate, Entity, User } from '../../../shared/src/types';
import { createDonationCertificateCH } from './pdfGeneration';
import { sendDonationCertificateMail } from './sendDonationCertificateMail';

export interface DonationCertificatesFunctionProps {
	users: Entity<User>[];
	year: number;
	mailFlag: boolean;
}

export const createDonationCertificatesFunction = functions.https.onCall(
	async ({ users, year, mailFlag }: DonationCertificatesFunctionProps) => {
		let successCount = 0;
		let skippedCount = 0;
		for (const user of users) {
			try {
				await withFile(async ({ path }) => {
					if (!user.values.location) throw new Error('User location missing');
					await createDonationCertificateCH(user, year, path);
					const { downloadUrl } = await uploadAndGetDownloadURL({
						sourceFilePath: path,
						destinationFilePath: `donation-certificates/${user.id}/${year}_${user.values.location}.pdf`,
					});
					storeDonationCertificate(user.id, { url: downloadUrl, country: user.values.location, year: year });
					if (mailFlag) {
						await sendDonationCertificateMail(user, year, path);
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

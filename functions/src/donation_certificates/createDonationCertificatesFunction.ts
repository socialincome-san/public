import * as functions from 'firebase-functions';
import { createWriteStream, unlinkSync } from 'fs';
import { useFirestore } from '../../../shared/src/firebase/firestoreAdmin';
import { uploadAndGetDownloadURL } from '../../../shared/src/firebase/storageAdmin';
import { DonationCertificate, Entity, User } from '../../../shared/src/types';
import { createDonationCertificateCH } from './pdfGeneration';

export interface DonationCertificatesFunctionProps {
	users: Entity<User>[];
	year: number;
}

export const createDonationCertificatesFunction = functions.https.onCall(
	async ({ users, year }: DonationCertificatesFunctionProps) => {
		const currentDateString = new Date().toLocaleDateString('de-DE');
		let successCount = 0;
		let skippedCount = 0;
		for (const user of users) {
			try {
				if (user.values.location !== 'CH') {
					skippedCount += 1;
					continue;
				}
				const tempPDFFileName = 'temp.pdf';
				const outputFile = createWriteStream(tempPDFFileName);
				await createDonationCertificateCH(user, year, currentDateString, outputFile);
				const { downloadUrl } = await uploadAndGetDownloadURL({
					sourceFilePath: tempPDFFileName,
					destinationFilePath: `donation-certificates/${user.id}/${year}_${user.values.location}_${currentDateString}.pdf`,
				});
				storeDonationCertificate(user.id, { url: downloadUrl, country: user.values.location, year: year });
				successCount += 1;
				unlinkSync(tempPDFFileName);
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
		.then(() => {
			console.log('Document successfully written!');
		})
		.catch((error) => {
			console.error('Error writing document: ', error);
		});
};

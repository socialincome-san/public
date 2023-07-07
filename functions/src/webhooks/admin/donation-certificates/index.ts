import * as functions from 'firebase-functions';
import { FirestoreAdmin } from '../../../../../shared/src/firebase/admin/FirestoreAdmin';
import { CreateDonationCertificatesFunctionProps, DonationCertificateHandler } from './DonationCertificateHandler';

export default functions.https.onCall(
	async ({ users, year, sendEmails }: CreateDonationCertificatesFunctionProps, { auth }) => {
		const firestoreAdmin = new FirestoreAdmin();
		await firestoreAdmin.assertGlobalAdmin(auth?.token?.email);

		const donationCertificateHandler = new DonationCertificateHandler();
		return await donationCertificateHandler.run(users, year, sendEmails);
	},
);

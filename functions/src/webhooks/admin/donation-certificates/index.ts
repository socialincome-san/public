import { onCall } from 'firebase-functions/v2/https';
import { FirestoreAdmin } from '../../../../../shared/src/firebase/admin/FirestoreAdmin';
import { CreateDonationCertificatesFunctionProps, DonationCertificateHandler } from './DonationCertificateHandler';

export default onCall<CreateDonationCertificatesFunctionProps, Promise<string>>(async (request) => {
	const firestoreAdmin = new FirestoreAdmin();
	await firestoreAdmin.assertGlobalAdmin(request.auth?.token?.email);

	const donationCertificateHandler = new DonationCertificateHandler();
	return await donationCertificateHandler.run(request.data.users, request.data.year, request.data.sendEmails);
});

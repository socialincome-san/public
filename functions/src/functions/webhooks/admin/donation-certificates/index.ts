import { onCall } from 'firebase-functions/v2/https';
import { FirestoreAdmin } from '../../../../../../shared/src/firebase/admin/FirestoreAdmin';
import { createDonationCertificates, CreateDonationCertificatesProps } from '../../../../lib/donation-certificates';

export default onCall<CreateDonationCertificatesProps, Promise<string>>({ memory: '4GiB' }, async (request) => {
	const firestoreAdmin = new FirestoreAdmin();
	await firestoreAdmin.assertGlobalAdmin(request.auth?.token?.email);

	return await createDonationCertificates(request.data);
});

import { withFile } from 'tmp-promise';
import { FirestoreAdmin } from '../../../../shared/src/firebase/admin/FirestoreAdmin';
import { StorageAdmin } from '../../../../shared/src/firebase/admin/StorageAdmin';
import {
	DONATION_CERTIFICATE_FIRESTORE_PATH,
	DonationCertificate,
} from '../../../../shared/src/types/donation-certificate';
import { User, USER_FIRESTORE_PATH } from '../../../../shared/src/types/user';
import { DonationCertificateWriter } from './DonationCertificateWriter';

export type CreateDonationCertificatesProps = {
	year: number;
	userIds?: string[];
};

export async function createDonationCertificates({ year, userIds }: CreateDonationCertificatesProps): Promise<string> {
	const storageAdmin = new StorageAdmin();
	const firestoreAdmin = new FirestoreAdmin();

	let [successCount, usersWithFailures] = [0, [] as string[]];

	if (!userIds) {
		userIds = (
			await firestoreAdmin
				.collection(USER_FIRESTORE_PATH)
				.where('address.country', '==', 'CH')
				.where('address.street', '!=', null)
				.select()
				.get()
		).docs.map((doc) => doc.id);
	}

	await Promise.all(
		userIds.map(async (userId) => {
			try {
				const userDoc = await firestoreAdmin.doc<User>(USER_FIRESTORE_PATH, userId).get();
				const writer = new DonationCertificateWriter(userDoc, year);
				const user = userDoc.data() as User;

				if (user.auth_user_id === undefined) {
					console.info(`User ${userId} has no auth_user_id, skipping donation certificate creation`);
					return;
				}

				// The Firebase auth user ID is used in the storage path to check the user's permissions in the storage rules.
				const destinationFilePath = `users/${user.auth_user_id}/donation-certificates/${year}.pdf`;

				await withFile(async ({ path }) => {
					await writer.writeDonationCertificatePDF(path);
					await storageAdmin.uploadFile({ sourceFilePath: path, destinationFilePath });
					await firestoreAdmin
						.collection(`${USER_FIRESTORE_PATH}/${userId}/${DONATION_CERTIFICATE_FIRESTORE_PATH}`)
						.doc(`${writer.year}-${user.address.country}`)
						.set(
							{
								year,
								country: user.address.country,
								storage_path: destinationFilePath,
							} as DonationCertificate,
							{ merge: true },
						);
					console.info(`Donation certificate document written for user ${userId}`);
					successCount += 1;
				});
			} catch (e) {
				usersWithFailures.push(userId);
				console.error(e);
			}
		}),
	);
	return `Successfully created ${successCount} donation certificates for ${year} 
	Users with errors (${usersWithFailures.length}): ${usersWithFailures.join(',')}`;
}

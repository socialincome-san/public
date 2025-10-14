import { DonationCertificate } from '@socialincome/shared/src/types/donation-certificate';
import { User } from '@socialincome/shared/src/types/user';
import { BaseExtractor } from '../core/base.extractor';
import {
	DONATION_CERTIFICATE_FIRESTORE_PATH,
	FirestoreDonationCertificateWithUser,
	FirestoreUserWithId,
	USER_FIRESTORE_PATH,
} from './donation-certificate.types';

export class DonationCertificateExtractor extends BaseExtractor<FirestoreDonationCertificateWithUser> {
	extract = async (): Promise<FirestoreDonationCertificateWithUser[]> => {
		const users = await this.loadAllUsers();
		const certificates = await this.loadAllDonationCertificates();
		return this.mergeCertificatesWithUsers(certificates, users);
	};

	private async loadAllUsers(): Promise<Map<string, FirestoreUserWithId>> {
		const snapshot = await this.firestore.collection(USER_FIRESTORE_PATH).get();
		const userMap = new Map<string, FirestoreUserWithId>();

		for (const doc of snapshot.docs) {
			const data = doc.data() as User;
			userMap.set(doc.id, { ...data, id: doc.id, legacyFirestoreId: doc.id });
		}

		return userMap;
	}

	private async loadAllDonationCertificates() {
		const snapshot = await this.firestore.collectionGroup(DONATION_CERTIFICATE_FIRESTORE_PATH).get();
		return snapshot.docs;
	}

	private mergeCertificatesWithUsers(
		docs: FirebaseFirestore.QueryDocumentSnapshot[],
		userMap: Map<string, FirestoreUserWithId>,
	): FirestoreDonationCertificateWithUser[] {
		const result: FirestoreDonationCertificateWithUser[] = [];

		for (const doc of docs) {
			const userId = this.extractUserIdFromPath(doc.ref.path);
			const user = userMap.get(userId);
			if (!user) continue;

			result.push({
				certificate: { ...(doc.data() as DonationCertificate), id: doc.id, legacyFirestoreId: doc.id },
				user,
			});
		}

		return result;
	}

	private extractUserIdFromPath(path: string): string {
		const parts = path.split('/');
		return parts[parts.indexOf('users') + 1];
	}
}

import {
	DONATION_CERTIFICATE_FIRESTORE_PATH,
	DonationCertificate,
} from '@socialincome/shared/src/types/donation-certificate';
import { USER_FIRESTORE_PATH, User } from '@socialincome/shared/src/types/user';
import { BaseExtractor } from '../core/base.extractor';

export type DonationCertificateWithEmail = DonationCertificate & { email: string };

export class DonationCertificatesExtractor extends BaseExtractor<DonationCertificateWithEmail> {
	extract = async (): Promise<DonationCertificateWithEmail[]> => {
		const users = await this.loadAllUsers();
		const docs = await this.loadAllDonationCertificates();
		return this.mergeCertificatesWithEmails(docs, users);
	};

	private async loadAllUsers(): Promise<Map<string, string>> {
		const snapshot = await this.firestore.collection(USER_FIRESTORE_PATH).get();
		const userMap = new Map<string, string>();

		for (const doc of snapshot.docs) {
			const data = doc.data() as User;
			if (data?.email) {
				userMap.set(doc.id, data.email);
			}
		}

		return userMap;
	}

	private async loadAllDonationCertificates() {
		const snapshot = await this.firestore.collectionGroup(DONATION_CERTIFICATE_FIRESTORE_PATH).get();
		return snapshot.docs;
	}

	private mergeCertificatesWithEmails(
		docs: FirebaseFirestore.QueryDocumentSnapshot[],
		userMap: Map<string, string>,
	): DonationCertificateWithEmail[] {
		const result: DonationCertificateWithEmail[] = [];

		for (const doc of docs) {
			const userId = this.extractUserIdFromPath(doc.ref.path);
			const email = userMap.get(userId);
			if (!email) continue;

			result.push({
				...(doc.data() as DonationCertificate),
				email,
			});
		}

		return result;
	}

	private extractUserIdFromPath(path: string): string {
		const parts = path.split('/');
		return parts[parts.indexOf('users') + 1];
	}
}

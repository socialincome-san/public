import { Contribution } from '@socialincome/shared/src/types/contribution';
import { User } from '@socialincome/shared/src/types/user';
import { BaseExtractor } from '../core/base.extractor';
import { CONTRIBUTION_FIRESTORE_PATH, FirestoreContributionWithUser, USER_FIRESTORE_PATH } from './contribution.types';

export class ContributionExtractor extends BaseExtractor<FirestoreContributionWithUser> {
	extract = async (): Promise<FirestoreContributionWithUser[]> => {
		const userMap = await this.loadAllUsers();
		const contributionDocs = await this.loadAllContributions();
		return this.mergeContributions(contributionDocs, userMap);
	};

	private async loadAllUsers(): Promise<Map<string, User>> {
		const snapshot = await this.firestore.collection(USER_FIRESTORE_PATH).get();
		const map = new Map<string, User>();
		for (const doc of snapshot.docs) {
			map.set(doc.id, doc.data() as User);
		}
		return map;
	}

	private async loadAllContributions() {
		const snapshot = await this.firestore.collectionGroup(CONTRIBUTION_FIRESTORE_PATH).get();
		return snapshot.docs;
	}

	private mergeContributions(
		docs: FirebaseFirestore.QueryDocumentSnapshot[],
		userMap: Map<string, User>,
	): FirestoreContributionWithUser[] {
		const results: FirestoreContributionWithUser[] = [];

		for (const doc of docs) {
			const userId = this.extractUserId(doc.ref.path);
			const user = userMap.get(userId);
			if (!user) continue;

			results.push({
				contribution: {
					...(doc.data() as Contribution),
					id: doc.id, // preserve Firestore ID
				},
				user: {
					...user,
					id: userId, // Firestore user ID
				},
			});
		}

		return results;
	}

	private extractUserId(path: string): string {
		const parts = path.split('/');
		return parts[parts.indexOf('users') + 1];
	}
}

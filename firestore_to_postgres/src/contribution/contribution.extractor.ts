import { Contribution, CONTRIBUTION_FIRESTORE_PATH } from '@socialincome/shared/src/types/contribution';
import { User, USER_FIRESTORE_PATH } from '@socialincome/shared/src/types/user';
import { BaseExtractor } from '../core/base.extractor';

export type UserWithId = User & { id: string };

export type ContributionWithUser = {
	contribution: Contribution;
	user: UserWithId;
};

export class ContributionsExtractor extends BaseExtractor<ContributionWithUser> {
	extract = async (): Promise<ContributionWithUser[]> => {
		const userMap = await this.loadAllUsers();
		const contributionDocs = await this.loadAllContributionDocs();
		return this.mergeContributionsWithUsers(contributionDocs, userMap);
	};

	loadAllUsers = async (): Promise<Map<string, User>> => {
		const snapshot = await this.firestore.collection(USER_FIRESTORE_PATH).get();
		const map = new Map<string, User>();
		for (const doc of snapshot.docs) {
			map.set(doc.id, doc.data() as User);
		}
		return map;
	};

	loadAllContributionDocs = async () => {
		const snapshot = await this.firestore.collectionGroup(CONTRIBUTION_FIRESTORE_PATH).get();
		return snapshot.docs;
	};

	mergeContributionsWithUsers(
		docs: FirebaseFirestore.QueryDocumentSnapshot[],
		userMap: Map<string, User>,
	): ContributionWithUser[] {
		const contributions: ContributionWithUser[] = [];

		for (const doc of docs) {
			const userId = this.extractUserIdFromPath(doc.ref.path);
			const user = userMap.get(userId);
			if (!user) continue;

			contributions.push({
				contribution: doc.data() as Contribution,
				user: { ...user, id: userId },
			});
		}

		return contributions;
	}

	extractUserIdFromPath(path: string): string {
		const parts = path.split('/');
		return parts[parts.indexOf('users') + 1];
	}
}

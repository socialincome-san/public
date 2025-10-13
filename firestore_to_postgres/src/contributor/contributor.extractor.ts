import { USER_FIRESTORE_PATH } from '@socialincome/shared/src/types/user';
import { BaseExtractor } from '../core/base.extractor';
import { FirestoreContributorWithId } from './contributor.types';

export class ContributorExtractor extends BaseExtractor<FirestoreContributorWithId> {
	extract = async (): Promise<FirestoreContributorWithId[]> => {
		const docs = await this.firestore.getAllWithIds(USER_FIRESTORE_PATH);

		return docs.map(({ id, data }) => ({
			...(data as Omit<FirestoreContributorWithId, 'id'>),
			id,
		}));
	};
}

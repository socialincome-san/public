import { User as FirestoreUser, USER_FIRESTORE_PATH } from '@socialincome/shared/src/types/user';
import { BaseExtractor } from '../core/base.extractor';

export class UsersExtractor extends BaseExtractor<FirestoreUser> {
	extract = async (): Promise<FirestoreUser[]> => {
		return await this.firestore.getAll<FirestoreUser>(USER_FIRESTORE_PATH);
	};
}

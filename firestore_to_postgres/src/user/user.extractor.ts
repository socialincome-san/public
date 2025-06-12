import { User as FirestoreUser } from '@socialincome/shared/src/types/user';
import { BaseExtractor } from '../core/base.extractor';

export class UsersExtractor extends BaseExtractor<FirestoreUser> {
	extract = async (): Promise<FirestoreUser[]> => {
		return await this.firestore.getAll<FirestoreUser>('users');
	};
}

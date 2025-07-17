import { ADMIN_USER_FIRESTORE_PATH, AdminUser } from '@socialincome/shared/src/types/admin-user';
import { BaseExtractor } from '../core/base.extractor';

export type AdminUserWithEmail = AdminUser & { email: string };

export class AdminsExtractor extends BaseExtractor<AdminUserWithEmail> {
	extract = async (): Promise<AdminUserWithEmail[]> => {
		const rawDocs = await this.firestore.getAllWithIds<AdminUser>(ADMIN_USER_FIRESTORE_PATH);

		return rawDocs.map(({ id, data }) => ({
			...data,
			email: id,
		}));
	};
}

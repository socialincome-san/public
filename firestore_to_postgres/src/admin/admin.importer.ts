import { UserService } from '@socialincome/shared/src/database/services/user/user.service';
import { CreateUserInput } from '@socialincome/shared/src/database/services/user/user.types';
import { BaseImporter } from '../core/base.importer';

export class AdminsImporter extends BaseImporter<CreateUserInput> {
	private readonly userService = new UserService();

	import = async (admins: CreateUserInput[]): Promise<number> => {
		let createdCount = 0;

		for (const admin of admins) {
			const result = await this.userService.create(admin);

			if (result.success) {
				createdCount++;
			} else {
				console.warn(`[AdminsImporter] Skipped admin:`, {
					email: admin.email,
					reason: result.error,
				});
			}
		}

		return createdCount;
	};
}

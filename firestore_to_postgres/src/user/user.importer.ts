import { UserService } from '@socialincome/shared/src/database/services/user/user.service';
import { BaseImporter } from '../core/base.importer';
import { OrganizationUtils } from '../organization/organization.utils';
import { CreateUserWithoutOrganization } from './user.transformer';

export class UsersImporter extends BaseImporter<CreateUserWithoutOrganization> {
	private readonly userService = new UserService();

	import = async (users: CreateUserWithoutOrganization[]): Promise<number> => {
		let createdCount = 0;

		const organizationId = await OrganizationUtils.getOrCreateSocialIncomeOrganizationId();
		if (!organizationId) {
			console.error('❌ Could not determine organization ID.');
			return 0;
		}

		for (const user of users) {
			const result = await this.userService.create({
				...user,
				organizationId,
			});

			if (result.success) {
				createdCount++;
			} else {
				console.warn(`[UsersImporter] Skipped user:`, {
					email: user.email,
					reason: result.error,
				});
			}
		}

		return createdCount;
	};
}

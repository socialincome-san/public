import { LocalPartnerService } from '@socialincome/shared/src/database/services/local-partner/local-partner.service';
import { UserService } from '@socialincome/shared/src/database/services/user/user.service';
import { BaseImporter } from '../core/base.importer';
import { CreateLocalPartnerWithUser } from './local-partner.transformer';

export class LocalPartnersImporter extends BaseImporter<CreateLocalPartnerWithUser> {
	private readonly userService: UserService;
	private readonly localPartnerService: LocalPartnerService;

	constructor() {
		super();
		this.userService = new UserService();
		this.localPartnerService = new LocalPartnerService();
	}

	import = async (records: CreateLocalPartnerWithUser[]): Promise<number> => {
		let createdCount = 0;

		for (const record of records) {
			const userResult = await this.userService.create(record.user);

			if (userResult.success !== true) {
				console.warn(`[LocalPartnersImporter] Skipped due to user conflict:`, {
					email: record.user.email,
					authUserId: record.user.authUserId,
					reason: userResult.error,
				});
				continue;
			}

			const partnerResult = await this.localPartnerService.create({
				...record.localPartner,
				userId: userResult.data.id,
			});

			if (partnerResult.success) {
				createdCount++;
			} else {
				console.error(`[LocalPartnersImporter] Failed to create local partner for user ${record.user.email}`);
			}
		}

		return createdCount;
	};
}

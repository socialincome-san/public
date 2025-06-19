import { LocalPartnerService } from '@socialincome/shared/src/database/local-partner/local-partner.service';
import { RecipientService } from '@socialincome/shared/src/database/recipient/recipient.service';
import { UserService } from '@socialincome/shared/src/database/user/user.service';
import { BaseImporter } from '../core/base.importer';
import { OrganizationUtils } from '../core/organization/organization.utils';
import { ProgramUtils } from '../core/program/program.utils';
import { CreateRecipientWithUser } from './recipient.transformer';

export class RecipientsImporter extends BaseImporter<CreateRecipientWithUser> {
	private readonly userService = new UserService();
	private readonly recipientService = new RecipientService();
	private readonly localPartnerService = new LocalPartnerService();

	import = async (records: CreateRecipientWithUser[]): Promise<number> => {
		let createdCount = 0;

		const organizationId = await OrganizationUtils.getOrCreateSocialIncomeOrganizationId();
		if (!organizationId) {
			console.error('❌ Failed to resolve organization. Aborting import.');
			return 0;
		}

		const programId = await ProgramUtils.getOrCreateSocialIncomeProgramId(organizationId);
		if (!programId) {
			console.error('❌ Failed to resolve program. Aborting import.');
			return 0;
		}

		for (const record of records) {
			const userResult = await this.userService.create({
				...record.user,
				organizationId,
			});

			if (!userResult.success) {
				console.warn(`[RecipientsImporter] Skipped user due to conflict:`, {
					email: record.user.email,
					authUserId: record.user.authUserId,
					reason: userResult.error,
				});
				continue;
			}

			const localPartner = record.partnerOrgName
				? await this.localPartnerService.findByName(record.partnerOrgName)
				: null;

			if (!localPartner) {
				console.warn(`[RecipientsImporter] Skipped recipient, could not resolve local partner:`, {
					email: record.user.email,
					partnerOrgName: record.partnerOrgName,
				});
				continue;
			}

			const recipientResult = await this.recipientService.create({
				...record.recipient,
				userId: userResult.data.id,
				organizationId,
				programId,
				localPartnerId: localPartner.userId,
			});

			if (recipientResult.success) {
				createdCount++;
			} else {
				console.error(`[RecipientsImporter] Failed to create recipient for user ${record.user.email}`);
			}
		}

		return createdCount;
	};
}

import { CampaignService } from '@socialincome/shared/src/database/services/campaign/campaign.service';
import { BaseImporter } from '../core/base.importer';
import { OrganizationUtils } from '../organization/organization.utils';
import { ProgramUtils } from '../program/program.utils';
import { CreateCampaignWithoutFK } from './campaign.transformer';

export class CampaignsImporter extends BaseImporter<CreateCampaignWithoutFK> {
	private readonly campaignService = new CampaignService();

	import = async (campaigns: CreateCampaignWithoutFK[]): Promise<number> => {
		let createdCount = 0;

		const organizationId = await OrganizationUtils.getOrCreateDefaultOrganizationId();
		if (!organizationId) {
			console.error('❌ Could not resolve organization ID. Aborting campaign import.');
			return 0;
		}

		const programId = await ProgramUtils.getOrCreateDefaultProgramId(organizationId);
		if (!programId) {
			console.error('❌ Could not resolve program ID. Aborting campaign import.');
			return 0;
		}

		for (const campaign of campaigns) {
			const result = await this.campaignService.create({
				...campaign,
				programId,
			});

			if (result.success) {
				createdCount++;
			} else {
				console.warn(`[CampaignsImporter] Skipped campaign:`, {
					title: campaign.title,
					reason: result.error,
				});
			}
		}

		return createdCount;
	};
}

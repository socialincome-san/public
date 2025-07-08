import { CreateCampaignInput } from '@socialincome/shared/src/database/services/campaign/campaign.types';
import { CampaignStatus, Campaign as FirestoreCampaign } from '@socialincome/shared/src/types/campaign';
import { BaseTransformer } from '../core/base.transformer';

export type CreateCampaignWithoutFK = Omit<CreateCampaignInput, 'organizationId' | 'programId'>;

export class CampaignsTransformer extends BaseTransformer<FirestoreCampaign, CreateCampaignWithoutFK> {
	transform = async (input: FirestoreCampaign[]): Promise<CreateCampaignWithoutFK[]> => {
		return input.map((raw): CreateCampaignWithoutFK => {
			return {
				title: raw.title,
				description: raw.description,
				creatorEmail: raw.creator_name,
				creatorName: raw.creator_name,
				secondDescriptionTitle: raw.second_description_title ?? null,
				secondDescription: raw.second_description ?? null,
				thirdDescriptionTitle: raw.third_description_title ?? null,
				thirdDescription: raw.third_description ?? null,
				linkWebsite: raw.link_website ?? null,
				linkInstagram: raw.link_instagram ?? null,
				linkTiktok: raw.link_tiktok ?? null,
				linkFacebook: raw.link_facebook ?? null,
				linkX: raw.link_x ?? null,
				goal: raw.goal ?? null,
				currency: raw.goal_currency ?? null,
				additionalAmountChf: raw.additional_amount_chf ?? null,
				endDate: raw.end_date.toDate(),
				isActive: raw.status === CampaignStatus.Active,
				public: raw.public ?? null,
				featured: raw.featured ?? null,
				slug: raw.slug ?? null,
				metadataDescription: raw.metadata_description ?? null,
				metadataOgImage: raw.metadata_ogImage ?? null,
				metadataTwitterImage: raw.metadata_twitterImage ?? null,
			};
		});
	};
}

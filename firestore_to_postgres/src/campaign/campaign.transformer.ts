import { CampaignStatus } from '@socialincome/shared/src/types/campaign';
import { DEFAULT_ORGANIZATION, DEFAULT_PROGRAM } from '../../scripts/seed-defaults';
import { BaseTransformer } from '../core/base.transformer';
import { CampaignCreateInput, FirestoreCampaignWithId } from './campaign.types';

export class CampaignTransformer extends BaseTransformer<FirestoreCampaignWithId, CampaignCreateInput> {
	transform = async (input: FirestoreCampaignWithId[]): Promise<CampaignCreateInput[]> => {
		return input.map(
			(raw): CampaignCreateInput => ({
				legacyFirestoreId: raw.id,
				title: raw.title,
				description: raw.description,
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
				currency: raw.goal_currency ?? 'CHF',
				additionalAmountChf: raw.additional_amount_chf ?? null,
				endDate: raw.end_date.toDate(),
				isActive: raw.status === CampaignStatus.Active,
				public: raw.public ?? null,
				featured: raw.featured ?? null,
				slug: raw.slug ?? null,
				metadataDescription: raw.metadata_description ?? null,
				metadataOgImage: raw.metadata_ogImage ?? null,
				metadataTwitterImage: raw.metadata_twitterImage ?? null,
				creatorName: raw.creator_name ?? null,
				creatorEmail: raw.email ?? null,
				organization: { connect: { name: DEFAULT_ORGANIZATION.name } },
				program: { connect: { name: DEFAULT_PROGRAM.name } },
			}),
		);
	};
}

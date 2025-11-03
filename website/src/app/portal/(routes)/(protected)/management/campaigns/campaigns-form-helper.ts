import {
	CampaignsCreateInput,
	CampaignsUpdateInput,
} from '@socialincome/shared/src/database/services/campaign/campaign.types';
import { CampaignsFormSchema } from './campaigns-form';

export function buildUpdateCampaignsInput(schema: CampaignsFormSchema): CampaignsUpdateInput {
	return {
		title: schema.fields.title.value,
		description: schema.fields.description.value,
		secondDescriptionTitle: schema.fields.secondDescriptionTitle.value,
		secondDescription: schema.fields.secondDescription.value,
		thirdDescriptionTitle: schema.fields.thirdDescriptionTitle.value,
		thirdDescription: schema.fields.thirdDescription.value,
		linkWebsite: schema.fields.linkWebsite.value,
		linkInstagram: schema.fields.linkInstagram.value,
		linkTiktok: schema.fields.linkTiktok.value,
		linkFacebook: schema.fields.linkFacebook.value,
		linkX: schema.fields.linkX.value,
		goal: schema.fields.goal.value,
		currency: schema.fields.currency.value,
		additionalAmountChf: schema.fields.additionalAmountChf.value,
		endDate: schema.fields.endDate.value,
		isActive: schema.fields.isActive.value,
		public: schema.fields.public.value,
		featured: schema.fields.featured.value,
		slug: schema.fields.slug.value,
		metadataDescription: schema.fields.metadataDescription.value,
		metadataOgImage: schema.fields.metadataOgImage.value,
		metadataTwitterImage: schema.fields.metadataTwitterImage.value,
		creatorName: schema.fields.creatorName.value,
		creatorEmail: schema.fields.creatorEmail.value,
		program: { connect: { id: schema.fields.program.value } },
	};
}

export function buildCreateCampaignsInput(schema: CampaignsFormSchema): CampaignsCreateInput {
	return {
		title: schema.fields.title.value,
		description: schema.fields.description.value,
		secondDescriptionTitle: schema.fields.secondDescriptionTitle.value,
		secondDescription: schema.fields.secondDescription.value,
		thirdDescriptionTitle: schema.fields.thirdDescriptionTitle.value,
		thirdDescription: schema.fields.thirdDescription.value,
		linkWebsite: schema.fields.linkWebsite.value,
		linkInstagram: schema.fields.linkInstagram.value,
		linkTiktok: schema.fields.linkTiktok.value,
		linkFacebook: schema.fields.linkFacebook.value,
		linkX: schema.fields.linkX.value,
		goal: schema.fields.goal.value,
		currency: schema.fields.currency.value,
		additionalAmountChf: schema.fields.additionalAmountChf.value,
		endDate: schema.fields.endDate.value,
		isActive: schema.fields.isActive.value,
		public: schema.fields.public.value,
		featured: schema.fields.featured.value,
		slug: schema.fields.slug.value,
		metadataDescription: schema.fields.metadataDescription.value,
		metadataOgImage: schema.fields.metadataOgImage.value,
		metadataTwitterImage: schema.fields.metadataTwitterImage.value,
		creatorName: schema.fields.creatorName.value,
		creatorEmail: schema.fields.creatorEmail.value,
		program: { connect: { id: schema.fields.program.value } },
	};
}

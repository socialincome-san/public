import { FormField } from '@/components/dynamic-form/dynamic-form';
import { getZodEnum } from '@/components/dynamic-form/helper';
import { websiteCurrencies } from '@/lib/i18n/utils';
import { CampaignsCreateInput, CampaignsUpdateInput } from '@/lib/services/campaign/campaign.types';
import z from 'zod';

type CampaignsFormSchema = {
	label: string;
	fields: {
		title: FormField;
		description: FormField;
		secondDescriptionTitle: FormField;
		secondDescription: FormField;
		thirdDescriptionTitle: FormField;
		thirdDescription: FormField;
		linkWebsite: FormField;
		linkInstagram: FormField;
		linkTiktok: FormField;
		linkFacebook: FormField;
		linkX: FormField;
		goal: FormField;
		currency: FormField;
		additionalAmountChf: FormField;
		endDate: FormField;
		isActive: FormField;
		public: FormField;
		featured: FormField;
		slug: FormField;
		metadataDescription: FormField;
		metadataOgImage: FormField;
		metadataTwitterImage: FormField;
		creatorName: FormField;
		creatorEmail: FormField;
		program: FormField;
	};
};
export const initialFormSchema: CampaignsFormSchema = {
	label: 'Campaign',
	fields: {
		title: {
			placeholder: 'Title of the content',
			label: 'Title',
			zodSchema: z.string().min(1, 'Title is required.'),
		},
		description: {
			placeholder: 'A detailed description...',
			label: 'Description',
			zodSchema: z.string().min(1, 'Description is required.'),
		},
		secondDescriptionTitle: {
			placeholder: 'Second Description Title',
			label: 'Second Description Title',
			zodSchema: z.string().optional(),
		},
		secondDescription: {
			placeholder: 'Additional details...',
			label: 'Second Description',
			zodSchema: z.string().optional(),
		},
		thirdDescriptionTitle: {
			placeholder: 'Third Description Title',
			label: 'Third Description Title',
			zodSchema: z.string().optional(),
		},
		thirdDescription: {
			placeholder: 'Final additional details...',
			label: 'Third Description',
			zodSchema: z.string().optional(),
		},
		linkWebsite: {
			placeholder: 'https://www.yourwebsite.com',
			label: 'Website Link',
			zodSchema: z.string().optional(),
		},
		linkInstagram: {
			placeholder: 'Your Instagram handle or profile URL',
			label: 'Instagram Link',
			zodSchema: z.string().optional(),
		},
		linkTiktok: {
			placeholder: 'Your TikTok handle or profile URL',
			label: 'TikTok Link',
			zodSchema: z.string().optional(),
		},
		linkFacebook: {
			placeholder: 'Your Facebook profile or page URL',
			label: 'Facebook Link',
			zodSchema: z.string().optional(),
		},
		linkX: {
			placeholder: 'Your X (Twitter) handle or profile URL',
			label: 'X (Twitter) Link',
			zodSchema: z.string().optional(),
		},
		goal: {
			placeholder: 'Target amount for goal',
			label: 'Goal Amount',
			zodSchema: z.number().positive('Goal must be positive').nullable(),
		},
		currency: {
			placeholder: 'USD, EUR, CHF',
			label: 'Currency Code',
			zodSchema: z.nativeEnum(getZodEnum(websiteCurrencies.map((c) => ({ id: c, label: c })))),
		},
		additionalAmountChf: {
			placeholder: 'Additional Amount in CHF',
			label: 'Additional CHF Amount',
			zodSchema: z.number().positive('Amount must be positive').nullable(),
		},
		endDate: {
			label: 'End Date',
			zodSchema: z.date().min(new Date('2020-01-01')).max(new Date('2050-12-31')),
		},
		isActive: {
			label: 'Active',
			zodSchema: z.boolean().optional(),
		},
		public: {
			placeholder: 'Is the item publicly visible?',
			label: 'Public',
			zodSchema: z.boolean().optional(),
		},
		featured: {
			placeholder: 'Should the item be featured?',
			label: 'Featured',
			zodSchema: z.boolean().optional(),
		},
		slug: {
			placeholder: 'unique-readable-id',
			label: 'Slug (URL Identifier)',
			zodSchema: z
				.string()
				.regex(/^[a-z0-9]+(?:[_-][a-z0-9]+)*$/, 'Invalid slug format.')
				.or(z.literal(''))
				.optional(),
		},
		metadataDescription: {
			placeholder: 'SEO description for search engines',
			label: 'Metadata Description',
			zodSchema: z.string().max(300).optional(),
		},
		metadataOgImage: {
			placeholder: 'URL for Open Graph Image',
			label: 'Open Graph Image URL',
			zodSchema: z.string().optional(),
		},
		metadataTwitterImage: {
			placeholder: 'URL for Twitter Card Image',
			label: 'Twitter Image URL',
			zodSchema: z.string().optional(),
		},
		creatorName: {
			placeholder: 'Name of the creator',
			label: 'Creator Name',
			zodSchema: z.string().optional(),
		},
		creatorEmail: {
			placeholder: 'Email of the creator',
			label: 'Creator Email',
			zodSchema: z.string().email('Must be a valid email address.').or(z.literal('')).optional(),
		},
		program: {
			placeholder: 'Program',
			label: 'Program',
		},
	},
};

export const buildUpdateCampaignsInput = (schema: CampaignsFormSchema): CampaignsUpdateInput => {
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

export const buildCreateCampaignsInput = (schema: CampaignsFormSchema): CampaignsCreateInput => {
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

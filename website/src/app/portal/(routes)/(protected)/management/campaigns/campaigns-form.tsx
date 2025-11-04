'use client';

import {
	createCampaignsAction,
	getCampaignsAction,
	getProgramsOptions,
	updateCampaignsAction,
} from '@/app/portal/server-actions/campaigns-actions';
import DynamicForm, { FormField } from '@/components/dynamic-form/dynamic-form';
import { getZodEnum } from '@/components/dynamic-form/helper';
import {
	CampaignPayload,
	CampaignsCreateInput,
	CampaignsUpdateInput,
} from '@socialincome/shared/src/database/services/campaign/campaign.types';
import { ProgramOption } from '@socialincome/shared/src/database/services/program/program.types';
import { useEffect, useState, useTransition } from 'react';
import z from 'zod';
import { buildCreateCampaignsInput, buildUpdateCampaignsInput } from './campaigns-form-helper';

export type CampaignsFormSchema = {
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
const initialFormSchema: CampaignsFormSchema = {
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
			zodSchema: z.string().optional(), // Optional field
		},
		secondDescription: {
			placeholder: 'Additional details...',
			label: 'Second Description',
			zodSchema: z.string().optional(), // Optional field
		},
		thirdDescriptionTitle: {
			placeholder: 'Third Description Title',
			label: 'Third Description Title',
			zodSchema: z.string().optional(), // Optional field
		},
		thirdDescription: {
			placeholder: 'Final additional details...',
			label: 'Third Description',
			zodSchema: z.string().optional(), // Optional field
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
			placeholder: 'e.g., USD, EUR, CHF',
			label: 'Currency Code',
			zodSchema: z.string().length(3, 'Currency code must be 3 letters.'), // Assuming a 3-letter currency code
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
			zodSchema: z.boolean(),
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
			zodSchema: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format.'), // Common slug format
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
			zodSchema: z.string().email('Must be a valid email address.').optional(),
		},
		program: {
			placeholder: 'Program',
			label: 'Program',
		},
	},
};

export default function CampaignsForm({
	onSuccess,
	onError,
	onCancel,
	campaignId,
}: {
	onSuccess?: () => void;
	onError?: (error?: unknown) => void;
	onCancel?: () => void;
	campaignId?: string;
}) {
	const [formSchema, setFormSchema] = useState<typeof initialFormSchema>(initialFormSchema);
	const [campaign, setCampaign] = useState<CampaignPayload>();
	const [isLoading, startTransition] = useTransition();

	useEffect(() => {
		if (campaignId) {
			// Load campaign
			startTransition(async () => await loadCampaign(campaignId));
		}
	}, [campaignId]);

	useEffect(() => {
		// load options for program and local partners
		startTransition(async () => {
			const programs = await getProgramsOptions();
			if (!programs.success) return;
			setOptions(programs.data);
		});
	}, []);

	const loadCampaign = async (campaignId: string) => {
		if (campaignId) {
			try {
				const result = await getCampaignsAction(campaignId);
				if (result.success) {
					setCampaign(result.data);
					console.log('Loaded campaign:', result.data);
					const newSchema = { ...formSchema };
					newSchema.fields.title.value = result.data.title;
					newSchema.fields.description.value = result.data.description;
					newSchema.fields.secondDescriptionTitle.value = result.data.secondDescriptionTitle;
					newSchema.fields.secondDescription.value = result.data.secondDescription;
					newSchema.fields.thirdDescriptionTitle.value = result.data.thirdDescriptionTitle;
					newSchema.fields.thirdDescription.value = result.data.thirdDescription;
					newSchema.fields.linkWebsite.value = result.data.linkWebsite;
					newSchema.fields.linkInstagram.value = result.data.linkInstagram;
					newSchema.fields.linkTiktok.value = result.data.linkTiktok;
					newSchema.fields.linkFacebook.value = result.data.linkFacebook;
					newSchema.fields.linkX.value = result.data.linkX;
					newSchema.fields.goal.value = result.data.goal;
					newSchema.fields.currency.value = result.data.currency;
					newSchema.fields.additionalAmountChf.value = result.data.additionalAmountChf;
					newSchema.fields.endDate.value = result.data.endDate ?? undefined;
					newSchema.fields.isActive.value = result.data.isActive;
					newSchema.fields.public.value = result.data.public;
					newSchema.fields.featured.value = result.data.featured;
					newSchema.fields.slug.value = result.data.slug;
					newSchema.fields.metadataDescription.value = result.data.metadataDescription;
					newSchema.fields.metadataOgImage.value = result.data.metadataOgImage;
					newSchema.fields.metadataTwitterImage.value = result.data.metadataTwitterImage;
					newSchema.fields.creatorName.value = result.data.creatorName;
					newSchema.fields.creatorEmail.value = result.data.creatorEmail;
					newSchema.fields.program.value = result.data.program?.id;
					setFormSchema(newSchema);
				} else {
					onError?.(result.error);
				}
			} catch (error: unknown) {
				onError?.(error);
			}
		}
	};

	const setOptions = (programs: ProgramOption[]) => {
		const optionsToZodEnum = (options: ProgramOption[]) =>
			getZodEnum(options.map(({ id, name }) => ({ id, label: name })));

		setFormSchema((prevSchema) => ({
			...prevSchema,
			fields: {
				...prevSchema.fields,
				program: {
					...prevSchema.fields.program,
					zodSchema: z.nativeEnum(optionsToZodEnum(programs)),
				},
			},
		}));
	};

	async function onSubmit(schema: typeof initialFormSchema) {
		startTransition(async () => {
			try {
				let res;
				if (campaignId) {
					const data: CampaignsUpdateInput = buildUpdateCampaignsInput(schema);
					res = await updateCampaignsAction({ id: campaignId, ...data });
				} else {
					const data: CampaignsCreateInput = buildCreateCampaignsInput(schema);
					res = await createCampaignsAction(data);
				}
				res.success ? onSuccess?.() : onError?.(res.error);
			} catch (error: unknown) {
				onError?.(error);
			}
		});
	}

	return (
		<DynamicForm
			formSchema={formSchema}
			isLoading={isLoading}
			onSubmit={onSubmit}
			onCancel={onCancel}
			mode={campaignId ? 'edit' : 'add'}
		/>
	);
}

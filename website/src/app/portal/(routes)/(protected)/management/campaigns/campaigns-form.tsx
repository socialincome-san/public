'use client';

import {
	createCampaignsAction,
	getCampaignsAction,
	getProgramsOptions,
	updateCampaignsAction,
} from '@/app/portal/server-actions/campaigns-actions';
import DynamicForm from '@/components/dynamic-form/dynamic-form';
import { getZodEnum } from '@/components/dynamic-form/helper';
import {
	CampaignsCreateInput,
	CampaignsUpdateInput,
} from '@socialincome/shared/src/database/services/campaign/campaign.types';
import { ProgramOption } from '@socialincome/shared/src/database/services/program/program.types';
import { useEffect, useState, useTransition } from 'react';
import z from 'zod';
import { buildCreateCampaignsInput, buildUpdateCampaignsInput, initialFormSchema } from './campaigns-form-helper';

export default function CampaignsForm({
	onSuccess,
	onError,
	onCancel,
	campaignId,
	readOnly,
}: {
	onSuccess?: () => void;
	onError?: (error?: unknown) => void;
	onCancel?: () => void;
	campaignId?: string;
	readOnly?: boolean;
}) {
	const [formSchema, setFormSchema] = useState<typeof initialFormSchema>(initialFormSchema);
	const [isLoading, startTransition] = useTransition();

	useEffect(() => {
		if (campaignId) {
			// Load campaign
			startTransition(async () => await loadCampaign(campaignId));
		}
	}, [campaignId]);

	useEffect(() => {
		// load options for program
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
			mode={readOnly ? 'readonly' : campaignId ? 'edit' : 'add'}
		/>
	);
}

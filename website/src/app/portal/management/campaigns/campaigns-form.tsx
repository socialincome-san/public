'use client';

import DynamicForm from '@/components/dynamic-form/dynamic-form';
import { getZodEnum } from '@/components/dynamic-form/helper';
import {
	createCampaignsAction,
	getCampaignsAction,
	getProgramsOptions,
	updateCampaignsAction,
} from '@/lib/server-actions/campaigns-actions';
import { handleServiceResult } from '@/lib/services/core/service-result-client';
import { ProgramOption } from '@/lib/services/program/program.types';
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

	const loadCampaign = async (campaignId: string) => {
		if (campaignId) {
			const result = await getCampaignsAction(campaignId);
			handleServiceResult(result, {
				onSuccess: (data) => {
					setFormSchema((previousSchema) => ({
						...previousSchema,
						fields: {
							...previousSchema.fields,
							title: { ...previousSchema.fields.title, value: data.title },
							description: { ...previousSchema.fields.description, value: data.description },
							secondDescriptionTitle: {
								...previousSchema.fields.secondDescriptionTitle,
								value: data.secondDescriptionTitle,
							},
							secondDescription: { ...previousSchema.fields.secondDescription, value: data.secondDescription },
							thirdDescriptionTitle: {
								...previousSchema.fields.thirdDescriptionTitle,
								value: data.thirdDescriptionTitle,
							},
							thirdDescription: { ...previousSchema.fields.thirdDescription, value: data.thirdDescription },
							linkWebsite: { ...previousSchema.fields.linkWebsite, value: data.linkWebsite },
							linkInstagram: { ...previousSchema.fields.linkInstagram, value: data.linkInstagram },
							linkTiktok: { ...previousSchema.fields.linkTiktok, value: data.linkTiktok },
							linkFacebook: { ...previousSchema.fields.linkFacebook, value: data.linkFacebook },
							linkX: { ...previousSchema.fields.linkX, value: data.linkX },
							goal: { ...previousSchema.fields.goal, value: data.goal },
							currency: { ...previousSchema.fields.currency, value: data.currency },
							additionalAmountChf: {
								...previousSchema.fields.additionalAmountChf,
								value: data.additionalAmountChf,
							},
							endDate: { ...previousSchema.fields.endDate, value: data.endDate ?? undefined },
							isActive: { ...previousSchema.fields.isActive, value: data.isActive },
							public: { ...previousSchema.fields.public, value: data.public },
							featured: { ...previousSchema.fields.featured, value: data.featured },
							slug: { ...previousSchema.fields.slug, value: data.slug },
							metadataDescription: {
								...previousSchema.fields.metadataDescription,
								value: data.metadataDescription,
							},
							metadataOgImage: { ...previousSchema.fields.metadataOgImage, value: data.metadataOgImage },
							metadataTwitterImage: {
								...previousSchema.fields.metadataTwitterImage,
								value: data.metadataTwitterImage,
							},
							creatorName: { ...previousSchema.fields.creatorName, value: data.creatorName },
							creatorEmail: { ...previousSchema.fields.creatorEmail, value: data.creatorEmail },
							program: { ...previousSchema.fields.program, value: data.program?.id },
						},
					}));
				},
				onError: (error) => onError?.(error),
			});
		}
	};

	const setOptions = (programs: ProgramOption[]) => {
		const optionsToZodEnum = (options: ProgramOption[]) => getZodEnum(options.map(({ id, name }) => ({ id, label: name })));

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

	const onSubmit = (schema: typeof initialFormSchema) => {
		startTransition(async () => {
			const res = campaignId
				? await updateCampaignsAction(buildUpdateCampaignsInput(schema, campaignId))
				: await createCampaignsAction(buildCreateCampaignsInput(schema));
			handleServiceResult(res, {
				onSuccess: () => onSuccess?.(),
				onError: (error) => onError?.(error),
			});
		});
	};

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
			if (!programs.success) {
				return;
			}
			setOptions(programs.data);
		});
	}, []);

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

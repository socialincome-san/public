'use client';

import DynamicForm from '@/components/dynamic-form/dynamic-form';
import { clearFormSchemaValues, cloneFormSchema, getZodEnum } from '@/components/dynamic-form/helper';
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
	const [formSchema, setFormSchema] = useState<typeof initialFormSchema>(() => cloneFormSchema(initialFormSchema));
	const [isLoading, startTransition] = useTransition();
	const asOptionalString = (value: string | null | undefined) => value ?? undefined;

	const loadCampaign = async (campaignId: string) => {
		if (campaignId) {
			const result = await getCampaignsAction(campaignId);
			handleServiceResult(result, {
				onSuccess: (data) => {
					setFormSchema((previousSchema) => {
						const nextSchema = clearFormSchemaValues(previousSchema);

						return {
							...nextSchema,
							fields: {
								...nextSchema.fields,
								title: { ...nextSchema.fields.title, value: data.title },
								description: { ...nextSchema.fields.description, value: data.description },
								secondDescriptionTitle: {
									...nextSchema.fields.secondDescriptionTitle,
									value: asOptionalString(data.secondDescriptionTitle),
								},
								secondDescription: {
									...nextSchema.fields.secondDescription,
									value: asOptionalString(data.secondDescription),
								},
								thirdDescriptionTitle: {
									...nextSchema.fields.thirdDescriptionTitle,
									value: asOptionalString(data.thirdDescriptionTitle),
								},
								thirdDescription: {
									...nextSchema.fields.thirdDescription,
									value: asOptionalString(data.thirdDescription),
								},
								linkWebsite: { ...nextSchema.fields.linkWebsite, value: asOptionalString(data.linkWebsite) },
								linkInstagram: { ...nextSchema.fields.linkInstagram, value: asOptionalString(data.linkInstagram) },
								linkTiktok: { ...nextSchema.fields.linkTiktok, value: asOptionalString(data.linkTiktok) },
								linkFacebook: { ...nextSchema.fields.linkFacebook, value: asOptionalString(data.linkFacebook) },
								linkX: { ...nextSchema.fields.linkX, value: asOptionalString(data.linkX) },
								goal: { ...nextSchema.fields.goal, value: data.goal },
								currency: { ...nextSchema.fields.currency, value: data.currency },
								additionalAmountChf: {
									...nextSchema.fields.additionalAmountChf,
									value: data.additionalAmountChf,
								},
								endDate: { ...nextSchema.fields.endDate, value: data.endDate ?? undefined },
								isActive: { ...nextSchema.fields.isActive, value: data.isActive },
								public: { ...nextSchema.fields.public, value: data.public },
								featured: { ...nextSchema.fields.featured, value: data.featured },
								slug: { ...nextSchema.fields.slug, value: asOptionalString(data.slug) },
								metadataDescription: {
									...nextSchema.fields.metadataDescription,
									value: asOptionalString(data.metadataDescription),
								},
								metadataOgImage: {
									...nextSchema.fields.metadataOgImage,
									value: asOptionalString(data.metadataOgImage),
								},
								metadataTwitterImage: {
									...nextSchema.fields.metadataTwitterImage,
									value: asOptionalString(data.metadataTwitterImage),
								},
								creatorName: { ...nextSchema.fields.creatorName, value: asOptionalString(data.creatorName) },
								creatorEmail: { ...nextSchema.fields.creatorEmail, value: asOptionalString(data.creatorEmail) },
								program: { ...nextSchema.fields.program, value: data.program?.id },
							},
						};
					});
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
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

	let mode: 'readonly' | 'edit' | 'add' = 'add';
	if (readOnly) {
		mode = 'readonly';
	} else if (campaignId) {
		mode = 'edit';
	}

	return <DynamicForm formSchema={formSchema} isLoading={isLoading} onSubmit={onSubmit} onCancel={onCancel} mode={mode} />;
}

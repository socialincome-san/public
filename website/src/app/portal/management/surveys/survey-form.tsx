'use client';

import DynamicForm, { FormField } from '@/components/dynamic-form/dynamic-form';
import { getZodEnum } from '@/components/dynamic-form/helper';
import { SurveyQuestionnaire, SurveyStatus } from '@/generated/prisma/enums';
import { allWebsiteLanguages } from '@/lib/i18n/utils';
import {
	createSurveyAction,
	getSurveyAction,
	getSurveyRecipientOptionsAction,
	updateSurveyAction,
} from '@/lib/server-actions/survey-actions';
import { handleServiceResult } from '@/lib/services/core/service-result-client';
import type { RecipientOption } from '@/lib/services/recipient/recipient.types';
import type { SurveyPayload } from '@/lib/services/survey/survey.types';
import { useEffect, useRef, useState, useTransition } from 'react';
import z from 'zod';
import { buildCreateSurveyInput, buildUpdateSurveyInput } from './survey-form-helpers';

type SurveyFormProps = {
	onSuccess?: () => void;
	onError?: (error?: unknown) => void;
	onCancel?: () => void;
	surveyId?: string;
	readOnly?: boolean;
};

export type SurveyFormSchema = {
	label: string;
	fields: {
		name: FormField;
		recipientId: FormField;
		questionnaire: FormField;
		language: FormField;
		dueAt: FormField;
		status: FormField;
		accessEmail: FormField;
		accessPw: FormField;
	};
};

const initialFormSchema: SurveyFormSchema = {
	label: 'Survey',
	fields: {
		name: {
			placeholder: 'Survey name',
			label: 'Name',
			zodSchema: z.string().min(1, 'Name is required'),
		},
		recipientId: {
			placeholder: 'Recipient',
			label: 'Recipient',
			useCombobox: true,
		},
		questionnaire: {
			placeholder: 'Questionnaire',
			label: 'Questionnaire',
			zodSchema: z.nativeEnum(SurveyQuestionnaire),
		},
		language: {
			placeholder: 'Language',
			label: 'Language',
			zodSchema: z.nativeEnum(getZodEnum(allWebsiteLanguages.map((l) => ({ id: l, label: l })))),
		},
		dueAt: {
			placeholder: 'Due date',
			label: 'Due date',
			zodSchema: z.date().min(new Date('2020-01-01')).max(new Date('2050-12-31')).optional(),
		},
		status: {
			placeholder: 'Status',
			label: 'Status',
			zodSchema: z.nativeEnum(SurveyStatus),
		},
		accessEmail: {
			placeholder: 'Access email',
			label: 'Access email',
			zodSchema: z.string().email(),
		},
		accessPw: {
			placeholder: 'Access password',
			label: 'Access password',
			zodSchema: z.string().optional(),
		},
	},
};

export const SurveyForm = ({ onSuccess, onError, onCancel, surveyId, readOnly }: SurveyFormProps) => {
	const [formSchema, setFormSchema] = useState<SurveyFormSchema>(initialFormSchema);
	const [survey, setSurvey] = useState<SurveyPayload | null>(null);
	const [isLoading, startTransition] = useTransition();
	const onErrorRef = useRef(onError);
	onErrorRef.current = onError;

	useEffect(() => {
		if (!surveyId) {
			return;
		}

		startTransition(async () => {
			const surveyResult = await getSurveyAction(surveyId);
			handleServiceResult(surveyResult, {
				onSuccess: (data) => {
					setSurvey(data);
					setFormSchema((prev) => ({
						...prev,
						fields: {
							...prev.fields,
							name: { ...prev.fields.name, value: data.name },
							recipientId: { ...prev.fields.recipientId, value: data.recipientId },
							questionnaire: { ...prev.fields.questionnaire, value: data.questionnaire },
							language: { ...prev.fields.language, value: data.language },
							dueAt: { ...prev.fields.dueAt, value: data.dueAt },
							status: { ...prev.fields.status, value: data.status },
							accessEmail: { ...prev.fields.accessEmail, value: data.accessEmail },
						},
					}));
				},
				onError: (error) => onError?.(error),
			});
		});
	}, [onError, surveyId]);

	useEffect(() => {
		startTransition(async () => {
			const res = await getSurveyRecipientOptionsAction();
			handleServiceResult(res, {
				onSuccess: (data) => {
					const recipientEnum = getZodEnum(data.map((r: RecipientOption) => ({ id: r.id, label: r.fullName })));
					setFormSchema((prev) => ({
						...prev,
						fields: {
							...prev.fields,
							recipientId: {
								...prev.fields.recipientId,
								zodSchema: z.nativeEnum(recipientEnum),
							},
						},
					}));
				},
				onError: (error) => onError?.(error),
			});
		});
	}, []);

	const onSubmit = (schema: SurveyFormSchema) => {
		startTransition(async () => {
			if (surveyId && survey?.id !== surveyId) {
				return onError?.('Survey is still loading. Please try again.');
			}
			const result =
				surveyId && survey
					? await updateSurveyAction(buildUpdateSurveyInput(schema, survey))
					: await createSurveyAction(buildCreateSurveyInput(schema));
			handleServiceResult(result, {
				onSuccess: () => onSuccess?.(),
				onError: (error) => onError?.(error),
			});
		});
	};

	return (
		<DynamicForm
			formSchema={formSchema}
			isLoading={isLoading}
			onSubmit={onSubmit}
			onCancel={onCancel}
			mode={readOnly ? 'readonly' : surveyId ? 'edit' : 'add'}
		/>
	);
};

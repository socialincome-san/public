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
import type { RecipientOption } from '@/lib/services/recipient/recipient.types';
import type { SurveyPayload } from '@/lib/services/survey/survey.types';
import { useEffect, useState, useTransition } from 'react';
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
			zodSchema: z.string().min(1),
		},
	},
};

export function SurveyForm({ onSuccess, onError, onCancel, surveyId, readOnly }: SurveyFormProps) {
	const [formSchema, setFormSchema] = useState<SurveyFormSchema>(initialFormSchema);
	const [survey, setSurvey] = useState<SurveyPayload | null>(null);
	const [isLoading, startTransition] = useTransition();

	useEffect(() => {
		if (!surveyId) {
			return;
		}

		startTransition(async () => {
			try {
				const surveyResult = await getSurveyAction(surveyId);
				if (!surveyResult.success) {
					onError?.(surveyResult.error);
					return;
				}

				setSurvey(surveyResult.data);

				setFormSchema((prev) => ({
					...prev,
					fields: {
						...prev.fields,
						name: {
							...prev.fields.name,
							value: surveyResult.data.name,
						},
						recipientId: {
							...prev.fields.recipientId,
							value: surveyResult.data.recipientId,
						},
						questionnaire: {
							...prev.fields.questionnaire,
							value: surveyResult.data.questionnaire,
						},
						language: {
							...prev.fields.language,
							value: surveyResult.data.language,
						},
						dueAt: {
							...prev.fields.dueAt,
							value: surveyResult.data.dueAt,
						},
						status: {
							...prev.fields.status,
							value: surveyResult.data.status,
						},
						accessEmail: {
							...prev.fields.accessEmail,
							value: surveyResult.data.accessEmail,
						},
						accessPw: {
							...prev.fields.accessPw,
							value: surveyResult.data.accessPw,
						},
					},
				}));
			} catch (error) {
				onError?.(error);
			}
		});
	}, [surveyId, onError]);

	useEffect(() => {
		startTransition(async () => {
			try {
				const res = await getSurveyRecipientOptionsAction();
				if (!res.success) {
					return;
				}

				const recipientEnum = getZodEnum(res.data.map((r: RecipientOption) => ({ id: r.id, label: r.fullName })));

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
			} catch (error) {
				onError?.(error);
			}
		});
	}, [onError]);

	const onSubmit = (schema: SurveyFormSchema) => {
		startTransition(async () => {
			try {
				let result;

				if (surveyId && survey) {
					const data = buildUpdateSurveyInput(schema, survey);
					result = await updateSurveyAction(surveyId, data);
				} else {
					const data = buildCreateSurveyInput(schema);
					result = await createSurveyAction(data);
				}

				if (result.success) {
					onSuccess?.();
				} else {
					onError?.(result.error);
				}
			} catch (e) {
				onError?.(e);
			}
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
}

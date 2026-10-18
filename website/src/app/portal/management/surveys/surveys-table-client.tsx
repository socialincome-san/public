'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { getSurveysTableFilters, surveysTableConfig } from '@/components/data-table/configs/surveys-table.config';
import { useRecordDialog } from '@/components/data-table/hooks/use-record-dialog';
import { TableQueryState } from '@/components/data-table/query-state';
import type { SurveyTableViewRow } from '@/modules/surveys/survey.types';
import { ClipboardListIcon, PlusIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { translateManagementFilters, translateManagementTableConfig } from '../management-table-config';
import { GenerateSurveysDialog } from './generate-surveys-dialog';
import { SurveyFormDialog } from './survey-form-dialog';

type Props = {
	rows: SurveyTableViewRow[];
	error: string | null;
	query?: TableQueryState & { totalRows: number };
	programFilterOptions?: { id: string; name: string }[];
	recipientFilterOptions?: { id: string; name: string }[];
	showProgramFilter?: boolean;
	hideProgramName?: boolean;
};

export const SurveysTableClient = ({
	rows,
	error,
	query,
	programFilterOptions = [],
	recipientFilterOptions = [],
	showProgramFilter = true,
	hideProgramName = false,
}: Props) => {
	const t = useTranslations('portal-management');
	const { recordId: surveyId, open, openCreate, openRecord, onOpenChange } = useRecordDialog('surveyId');
	const [isGenerationDialogOpen, setIsGenerationDialogOpen] = useState(false);
	const config = translateManagementTableConfig(surveysTableConfig, {
		title: t('tables.surveys.title'),
		emptyMessage: t('tables.surveys.empty'),
		columns: {
			name: t('columns.name'),
			recipientName: t('columns.recipientName'),
			questionnaire: t('columns.questionnaire'),
			language: t('columns.language'),
			status: t('columns.status'),
			dueAt: t('columns.dueAt'),
			completedAt: t('columns.completedAt'),
			createdAt: t('columns.createdAt'),
			surveyUrl: t('columns.surveyUrl'),
			programName: t('columns.programName'),
		},
	});
	const filters = translateManagementFilters(
		getSurveysTableFilters({ query, programFilterOptions, recipientFilterOptions, showProgramFilter }),
		{
			program: { label: t('filters.program.label'), placeholder: t('filters.program.all') },
			recipient: { label: t('filters.recipient.label'), placeholder: t('filters.recipient.all') },
		},
	);

	return (
		<>
			<ConfiguredDataTableClient
				config={config}
				titleInfoTooltip={t('tables.surveys.tooltip')}
				rows={rows}
				error={error}
				query={query}
				toolbarFilters={filters}
				hideProgramName={hideProgramName}
				onRowClick={(row) => openRecord(row.id)}
				actionMenuItems={[
					{
						label: t('actions.addSurvey'),
						icon: <PlusIcon />,
						onSelect: openCreate,
					},
					{
						label: t('actions.generateSurveys'),
						icon: <ClipboardListIcon />,
						onSelect: () => setIsGenerationDialogOpen(true),
					},
				]}
			/>

			<SurveyFormDialog open={open} onOpenChange={onOpenChange} surveyId={surveyId} />

			<GenerateSurveysDialog open={isGenerationDialogOpen} setOpen={setIsGenerationDialogOpen} />
		</>
	);
};

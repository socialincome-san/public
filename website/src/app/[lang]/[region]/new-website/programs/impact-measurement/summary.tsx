import { Progress } from '@/components/progress';
import { services } from '@/lib/services/services';
import { SurveyImpactStudyDetailItem } from '@/lib/services/survey/survey-impact.types';
import { formatNumberLocale } from '@/lib/utils/string-utils';
import { ChevronDown } from 'lucide-react';
import { toImpactServiceFilters } from './filters.server';
import { getImpactTranslator } from './translator';

type ImpactMeasurementSummaryProps = {
	lang: string;
	searchParams: Record<string, string | undefined>;
};

const topItems = (items: SurveyImpactStudyDetailItem[], limit = 4): SurveyImpactStudyDetailItem[] => {
	return items.slice(0, limit);
};

export const ImpactMeasurementStudyDetails = async ({ lang, searchParams }: ImpactMeasurementSummaryProps) => {
	const translator = await getImpactTranslator(lang);
	const filters = toImpactServiceFilters(searchParams);
	const detailsResult = await services.surveyImpact.getImpactStudyDetails(filters);
	if (!detailsResult.success) {
		return (
			<p className="text-sm leading-5 font-medium text-cyan-900">{translator.t('survey.impactMeasurement.loadError')}</p>
		);
	}

	const details = detailsResult.data;
	const dateFormatter = new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'short', year: 'numeric' });
	const lastResponseLabel =
		details.lastResponseDaysAgo === null
			? translator.t('survey.impactMeasurement.lastResponseNotAvailable')
			: translator
					.t('survey.impactMeasurement.lastResponseDaysAgo')
					.replace('{{days}}', String(details.lastResponseDaysAgo));
	const timeFrameLabel =
		details.timeFrameStart && details.timeFrameEnd
			? `${dateFormatter.format(details.timeFrameStart)} - ${dateFormatter.format(details.timeFrameEnd)}`
			: translator.t('survey.impactMeasurement.notAvailable');
	const timeFrameDaysLabel =
		details.timeFrameDays === null
			? translator.t('survey.impactMeasurement.notAvailable')
			: `${formatNumberLocale(details.timeFrameDays, 'de-CH')} ${translator.t('survey.impactMeasurement.days')}`;
	const renderBreakdown = (label: string, items: SurveyImpactStudyDetailItem[], formatter: (value: string) => string) => {
		const topBreakdownItems = topItems(items);
		if (topBreakdownItems.length === 0) {
			return null;
		}

		return (
			<div className="space-y-2">
				<p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{label}</p>
				<div className="space-y-2">
					{topBreakdownItems.map((item) => (
						<div key={`${label}-${item.value}`} className="grid grid-cols-[minmax(120px,1fr)_100px_auto] items-center gap-3">
							<p className="truncate text-sm text-cyan-950">{formatter(item.value)}</p>
							<Progress value={item.percentage} className="h-1.5 bg-slate-200" />
							<p className="text-xs font-semibold text-cyan-900 tabular-nums">{item.count}</p>
						</div>
					))}
				</div>
			</div>
		);
	};

	return (
		<details className="group w-full overflow-hidden rounded-3xl border border-slate-200 bg-white">
			<summary
				data-testid="impact-measurement-study-details-trigger"
				className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 transition-colors marker:hidden hover:bg-slate-50 [&::-webkit-details-marker]:hidden"
			>
				<div className="flex min-w-0 flex-wrap items-center gap-2 text-sm leading-5 font-medium text-cyan-900">
					<span className="text-3xl leading-none font-semibold text-cyan-950">
						{formatNumberLocale(details.totalCompletedSurveys, 'de-CH')}
					</span>
					<span>{translator.t('survey.impactMeasurement.surveyResponsesFrom')}</span>
					<span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-sm font-medium">
						{details.totalRecipients} {translator.t('survey.impactMeasurement.recipients')}
					</span>
				</div>
				<ChevronDown className="size-5 text-cyan-900 transition-transform group-open:rotate-180" />
			</summary>

			<div className="space-y-5 border-t border-slate-200 px-5 pt-4 pb-5">
				<p className="text-sm font-medium text-slate-600">{lastResponseLabel}</p>
				<div className="space-y-1">
					<p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
						{translator.t('survey.impactMeasurement.timeFrame')}
					</p>
					<p className="text-base font-semibold text-cyan-950">{timeFrameLabel}</p>
					<p className="text-sm text-slate-600">{timeFrameDaysLabel}</p>
				</div>
				<div className="grid gap-5 md:grid-cols-3">
					{renderBreakdown(translator.t('survey.impactMeasurement.countryHeading'), details.countryBreakdown, (value) => {
						const translated = translator.t(value);

						return translated === value ? value : translated;
					})}
					{renderBreakdown(translator.t('survey.impactMeasurement.ageHeading'), details.ageBreakdown, (value) =>
						translator.t(`survey.impactMeasurement.recipientsFilter.age.${value}`),
					)}
					{renderBreakdown(translator.t('survey.impactMeasurement.genderHeading'), details.genderBreakdown, (value) =>
						translator.t(`survey.impactMeasurement.recipientsFilter.gender.${value}`),
					)}
				</div>
			</div>
		</details>
	);
};

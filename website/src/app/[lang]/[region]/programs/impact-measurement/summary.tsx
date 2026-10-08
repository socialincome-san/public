import { isMessageKey } from '@/lib/i18n/message-keys';
import { formatNumberLocale } from '@/lib/utils/string-utils';
import { getSurveyImpactStudyDetails } from '@/modules/surveys/survey.service';
import type { SurveyImpactStudyDetailItem } from '@/modules/surveys/survey.types';
import { Progress } from '@socialincome/design-system/feedback/progress/progress';
import { ChevronDown } from 'lucide-react';
import { getMessages, getTranslations } from 'next-intl/server';
import { toImpactServiceFilters } from './filters.server';

type ImpactMeasurementSummaryProps = {
	lang: string;
	searchParams: Record<string, string | undefined>;
};

const topItems = (items: SurveyImpactStudyDetailItem[], limit = 4): SurveyImpactStudyDetailItem[] => {
	return items.slice(0, limit);
};

export const ImpactMeasurementStudyDetails = async ({ lang, searchParams }: ImpactMeasurementSummaryProps) => {
	const [t, tCountries, messages, detailsResult] = await Promise.all([
		getTranslations('website-survey'),
		getTranslations('countries'),
		getMessages(),
		getSurveyImpactStudyDetails(toImpactServiceFilters(searchParams)),
	]);
	if (!detailsResult.success) {
		return <p className="text-foreground text-sm leading-5 font-medium">{t('survey.impactMeasurement.loadError')}</p>;
	}

	const details = detailsResult.data;
	const dateFormatter = new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'short', year: 'numeric' });
	const lastResponseLabel =
		details.lastResponseDaysAgo === null
			? t('survey.impactMeasurement.lastResponseNotAvailable')
			: t('survey.impactMeasurement.lastResponseDaysAgo', { days: details.lastResponseDaysAgo });
	const timeFrameLabel =
		details.timeFrameStart && details.timeFrameEnd
			? `${dateFormatter.format(details.timeFrameStart)} - ${dateFormatter.format(details.timeFrameEnd)}`
			: t('survey.impactMeasurement.notAvailable');
	const timeFrameDaysLabel =
		details.timeFrameDays === null
			? t('survey.impactMeasurement.notAvailable')
			: `${formatNumberLocale(details.timeFrameDays, 'de-CH')} ${t('survey.impactMeasurement.days')}`;
	const translateSurveyKey = (key: string) => (isMessageKey(messages, 'website-survey', key) ? t(key) : key);
	const renderBreakdown = (label: string, items: SurveyImpactStudyDetailItem[], formatter: (value: string) => string) => {
		const topBreakdownItems = topItems(items);
		if (topBreakdownItems.length === 0) {
			return null;
		}

		return (
			<div className="space-y-2">
				<p className="text-muted-foreground text-xs font-bold tracking-wide uppercase">{label}</p>
				<div className="space-y-2">
					{topBreakdownItems.map((item) => (
						<div key={`${label}-${item.value}`} className="grid grid-cols-[minmax(120px,1fr)_100px_auto] items-center gap-3">
							<p className="text-foreground truncate text-sm">{formatter(item.value)}</p>
							<Progress value={item.percentage} size="sm" />
							<p className="text-foreground text-xs font-bold">{item.count}</p>
						</div>
					))}
				</div>
			</div>
		);
	};

	return (
		<details className="border-border bg-card group w-full overflow-hidden rounded-3xl border">
			<summary
				data-testid="impact-measurement-study-details-trigger"
				className="hover:bg-muted/50 flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 transition-colors marker:hidden [&::-webkit-details-marker]:hidden"
			>
				<div className="text-foreground flex min-w-0 flex-wrap items-center gap-2 text-sm leading-5 font-medium">
					<span className="text-3xl leading-none font-bold">
						{formatNumberLocale(details.totalCompletedSurveys, 'de-CH')}
					</span>
					<span>{t('survey.impactMeasurement.surveyResponsesFrom')}</span>
					<span className="border-border bg-muted/50 rounded-full border px-2.5 py-0.5 text-sm font-medium">
						{details.totalRecipients} {t('survey.impactMeasurement.recipients')}
					</span>
				</div>
				<ChevronDown className="text-foreground size-5 transition-transform group-open:rotate-180" />
			</summary>

			<div className="border-border space-y-5 border-t px-5 pt-4 pb-5">
				<p className="text-muted-foreground text-sm font-medium">{lastResponseLabel}</p>
				<div className="space-y-1">
					<p className="text-muted-foreground text-xs font-bold tracking-wide uppercase">
						{t('survey.impactMeasurement.timeFrame')}
					</p>
					<p className="text-foreground text-base font-bold">{timeFrameLabel}</p>
					<p className="text-muted-foreground text-sm">{timeFrameDaysLabel}</p>
				</div>
				<div className="grid gap-5 md:grid-cols-3">
					{renderBreakdown(t('survey.impactMeasurement.countryHeading'), details.countryBreakdown, (value) =>
						isMessageKey(messages, 'countries', value) ? tCountries(value) : value,
					)}
					{renderBreakdown(t('survey.impactMeasurement.ageHeading'), details.ageBreakdown, (value) =>
						translateSurveyKey(`survey.impactMeasurement.recipientsFilter.age.${value}`),
					)}
					{renderBreakdown(t('survey.impactMeasurement.genderHeading'), details.genderBreakdown, (value) =>
						translateSurveyKey(`survey.impactMeasurement.recipientsFilter.gender.${value}`),
					)}
				</div>
			</div>
		</details>
	);
};

import { services } from '@/lib/services/services';
import { formatNumberLocale } from '@/lib/utils/string-utils';
import { toImpactServiceFilters } from './filters.server';
import { getImpactTranslator } from './translator';

type ImpactMeasurementSummaryProps = {
	lang: string;
	searchParams: Record<string, string | undefined>;
};

export const ImpactMeasurementSummary = async ({ lang, searchParams }: ImpactMeasurementSummaryProps) => {
	const translator = await getImpactTranslator(lang);
	const impactResult = await services.surveyImpact.getImpactMeasurements(toImpactServiceFilters(searchParams));
	if (!impactResult.success) {
		return (
			<p className="text-sm leading-5 font-medium text-cyan-900">{translator.t('survey.impactMeasurement.loadError')}</p>
		);
	}

	return (
		<p className="text-sm leading-5 font-medium text-cyan-900">
			{formatNumberLocale(impactResult.data.totalCompletedSurveys, 'de-CH')}{' '}
			{translator.t('survey.impactMeasurement.surveyResponsesFrom')} {impactResult.data.totalRecipients}{' '}
			{translator.t('survey.impactMeasurement.recipients')}
		</p>
	);
};

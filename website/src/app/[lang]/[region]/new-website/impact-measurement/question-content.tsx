import { DonutChart } from '@/components/charts/donut-chart';
import { Progress } from '@/components/progress';
import { SurveyImpactQuestion } from '@/lib/services/survey/survey-impact.types';
import { ImpactMeasurementPrivacyTooltip } from './privacy-tooltip';
import { getImpactTranslator } from './translator';

const isYesNoQuestion = (question: SurveyImpactQuestion): boolean => {
	const normalizedValues = new Set(question.options.map((option) => option.value.toLowerCase()));

	return normalizedValues.size === 2 && normalizedValues.has('true') && normalizedValues.has('false');
};

const renderOptionsDonut = (question: SurveyImpactQuestion, keyPrefix: string, translate: (key: string) => string) => {
	const sortedOptions = [...question.options].sort((left, right) => right.count - left.count);
	const optionsWithMeta = sortedOptions.map((option, index) => ({
		...option,
		optionLabel: question.choicesTranslationKey
			? translate(`${question.choicesTranslationKey}.${option.value}`)
			: option.value,
	}));

	return (
		<DonutChart
			options={optionsWithMeta.map((option) => ({
				id: `${keyPrefix}-${option.value}`,
				label: option.optionLabel,
				percentage: option.percentage,
				weight: option.count,
			}))}
			emptyLabel={translate('survey.impactMeasurement.notAvailable')}
		/>
	);
};

const renderOptionsProgressBars = (
	question: SurveyImpactQuestion,
	keyPrefix: string,
	translate: (key: string) => string,
) => {
	const sortedOptions = [...question.options].sort((left, right) => right.count - left.count);

	return (
		<div className="space-y-4" key={`${keyPrefix}-bars`}>
			{sortedOptions.map((option) => {
				const optionLabel = question.choicesTranslationKey
					? translate(`${question.choicesTranslationKey}.${option.value}`)
					: option.value;

				return (
					<div key={`${keyPrefix}-${option.value}`} className="space-y-1">
						<p className="text-base font-medium text-cyan-950">{optionLabel}</p>
						<Progress value={option.percentage} />
					</div>
				);
			})}
		</div>
	);
};

export const ImpactMeasurementQuestionContent = async ({
	question,
	keyPrefix,
	lang,
}: {
	question: SurveyImpactQuestion;
	keyPrefix: string;
	lang: string;
}) => {
	const translator = await getImpactTranslator(lang);
	const translate = translator.t.bind(translator);

	if (question.options.length === 0) {
		return (
			<div className="space-y-3">
				<div className="flex items-center gap-2 text-sm font-medium text-cyan-950">
					<span>{translate('survey.impactMeasurement.textResponseInsights')}</span>
					<ImpactMeasurementPrivacyTooltip message={translate('survey.impactMeasurement.textResponsePrivacyTooltip')} />
				</div>
				<p className="text-sm text-cyan-950">
					{question.answeredCount === 0
						? translate('survey.impactMeasurement.noTextResponsesYet')
						: `${question.answeredCount} ${translate('survey.impactMeasurement.textResponsesCollected')}`}
				</p>
			</div>
		);
	}

	return isYesNoQuestion(question)
		? renderOptionsDonut(question, keyPrefix, translate)
		: renderOptionsProgressBars(question, keyPrefix, translate);
};

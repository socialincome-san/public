import { DonutChart } from '@/components/charts/donut-chart';
import { type Messages } from '@/lib/i18n/messages';
import { isMessageKey } from '@/lib/utils/message-keys';
import type { SurveyImpactQuestion } from '@/modules/surveys/survey.types';
import { Progress } from '@socialincome/design-system/feedback/progress/progress';
import { type useTranslations } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { ImpactMeasurementPrivacyTooltip } from './privacy-tooltip';

type SurveyTranslator = ReturnType<typeof useTranslations<'website-survey'>>;

const isYesNoQuestion = (question: SurveyImpactQuestion): boolean => {
	const normalizedValues = new Set(question.options.map((option) => option.value.toLowerCase()));

	return normalizedValues.size === 2 && normalizedValues.has('true') && normalizedValues.has('false');
};

const getOptionLabel = (question: SurveyImpactQuestion, value: string, t: SurveyTranslator, messages: Messages) => {
	if (!question.choicesTranslationKey) {
		return value;
	}

	const key = `${question.choicesTranslationKey}.${value}`;

	return isMessageKey(messages, 'website-survey', key) ? t(key) : key;
};

const renderOptionsDonut = (question: SurveyImpactQuestion, keyPrefix: string, t: SurveyTranslator, messages: Messages) => {
	const sortedOptions = [...question.options].sort((left, right) => right.count - left.count);
	const optionsWithMeta = sortedOptions.map((option) => ({
		...option,
		optionLabel: getOptionLabel(question, option.value, t, messages),
	}));

	return (
		<DonutChart
			options={optionsWithMeta.map((option) => ({
				id: `${keyPrefix}-${option.value}`,
				label: option.optionLabel,
				percentage: option.percentage,
				weight: option.count,
			}))}
			emptyLabel={t('survey.impactMeasurement.notAvailable')}
		/>
	);
};

const renderOptionsProgressBars = (
	question: SurveyImpactQuestion,
	keyPrefix: string,
	t: SurveyTranslator,
	messages: Messages,
) => {
	const sortedOptions = [...question.options].sort((left, right) => right.count - left.count);

	return (
		<div className="space-y-4" key={`${keyPrefix}-bars`}>
			{sortedOptions.map((option) => {
				const optionLabel = getOptionLabel(question, option.value, t, messages);

				return (
					<div key={`${keyPrefix}-${option.value}`} className="space-y-1">
						<div className="flex items-baseline justify-between gap-3">
							<p className="text-foreground text-base font-medium">{optionLabel}</p>
							<p className="text-foreground text-sm font-medium">{option.percentage.toFixed(1)} %</p>
						</div>
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
}: {
	question: SurveyImpactQuestion;
	keyPrefix: string;
}) => {
	const [t, messages] = await Promise.all([getTranslations('website-survey'), getMessages()]);

	if (question.options.length === 0) {
		return (
			<div className="space-y-3">
				<div className="text-foreground flex items-center gap-2 text-sm font-medium">
					<span>{t('survey.impactMeasurement.textResponseInsights')}</span>
					<ImpactMeasurementPrivacyTooltip message={t('survey.impactMeasurement.textResponsePrivacyTooltip')} />
				</div>
				<p className="text-foreground text-sm">
					{question.answeredCount === 0
						? t('survey.impactMeasurement.noTextResponsesYet')
						: `${question.answeredCount} ${t('survey.impactMeasurement.textResponsesCollected')}`}
				</p>
			</div>
		);
	}

	return isYesNoQuestion(question)
		? renderOptionsDonut(question, keyPrefix, t, messages)
		: renderOptionsProgressBars(question, keyPrefix, t, messages);
};

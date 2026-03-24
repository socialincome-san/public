import { services } from '@/lib/services/services';
import { SurveyImpactQuestion } from '@/lib/services/survey/survey-impact.types';
import {
	followUpConfigs,
	highlightedQuestionOrder,
	questionInsightKeysByName,
	questionTypeLabelKeys,
} from './config';
import { toImpactServiceFilters } from './filters.server';
import { renderFollowUpSections } from './follow-ups';
import { ImpactMeasurementQuestionCard } from './question-card';
import { getImpactTranslator } from './translator';

type ImpactMeasurementResultsProps = {
	lang: string;
	searchParams: Record<string, string | undefined>;
};

export const ImpactMeasurementResults = async ({ lang, searchParams }: ImpactMeasurementResultsProps) => {
	// TEMP: Keep suspense fallback visible while polishing loading UX.
	await new Promise((resolve) => setTimeout(resolve, 2500));

	const impactFilters = toImpactServiceFilters(searchParams);

	const [translator, impactResult] = await Promise.all([
		getImpactTranslator(lang),
		services.surveyImpact.getImpactMeasurements(impactFilters),
	]);

	if (!impactResult.success) {
		return null;
	}

	const questionsByName = new Map(impactResult.data.questions.map((question) => [question.name, question]));
	const followUpQuestionNames = new Set(
		Object.values(followUpConfigs)
			.flat()
			.map((followUp) => followUp.childName),
	);
	const orderedQuestions = [
		...highlightedQuestionOrder
			.map((questionName) => questionsByName.get(questionName))
			.filter((question): question is NonNullable<typeof question> => Boolean(question)),
		...impactResult.data.questions.filter(
			(question) => !highlightedQuestionOrder.includes(question.name) && !followUpQuestionNames.has(question.name),
		),
	];
	const buildQuestionInsights = (question: SurveyImpactQuestion): string[] => {
		if (question.answeredCount === 0) {
			return [];
		}

		const insightKeys = questionInsightKeysByName[question.name] ?? [];

		return insightKeys.map((key) => translator.t(key)).filter((insight, index) => insight !== insightKeys[index]);
	};

	return (
		<div className="space-y-10">
			{await Promise.all(
				orderedQuestions.map(async (question, index) => (
					<ImpactMeasurementQuestionCard
						key={question.name}
						lang={lang}
						question={question}
						index={index}
						questionTypeLabelKey={
							questionTypeLabelKeys[question.inputType] ?? 'survey.impactMeasurement.questionTypes.fallback'
						}
						questionInsights={buildQuestionInsights(question)}
						followUpSections={await renderFollowUpSections({
							lang,
							question,
							questionsByName,
							followUpConfigs,
						})}
					/>
				)),
			)}
		</div>
	);
};

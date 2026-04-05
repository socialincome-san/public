import { services } from '@/lib/services/services';
import { followUpConfigs, highlightedQuestionOrder, questionTypeLabelKeys } from './config';
import { toImpactServiceFilters } from './filters.server';
import { renderFollowUpSections } from './follow-ups';
import { ImpactMeasurementQuestionCard } from './question-card';

type ImpactMeasurementResultsProps = {
	lang: string;
	searchParams: Record<string, string | undefined>;
};

export const ImpactMeasurementResults = async ({ lang, searchParams }: ImpactMeasurementResultsProps) => {
	const impactFilters = toImpactServiceFilters(searchParams);
	const impactResult = await services.surveyImpact.getImpactMeasurements(impactFilters);

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

import { SurveyImpactQuestion } from '@/lib/services/survey/survey-impact.types';
import { ReactNode } from 'react';
import { ImpactMeasurementQuestionContent } from './question-content';
import { getImpactTranslator } from './translator';

type FollowUpConfig = { childName: string; triggerValue?: string; triggerDescription?: string };

export const renderFollowUpSections = async ({
	lang,
	question,
	questionsByName,
	followUpConfigs,
}: {
	lang: string;
	question: SurveyImpactQuestion;
	questionsByName: Map<string, SurveyImpactQuestion>;
	followUpConfigs: Record<string, FollowUpConfig[]>;
}): Promise<ReactNode[]> => {
	const translator = await getImpactTranslator(lang);
	const translate = translator.t.bind(translator);
	const sections: ReactNode[] = [];
	const resolvedFollowUps = (followUpConfigs[question.name] ?? [])
		.map((config) => {
			const followUpQuestion = questionsByName.get(config.childName);
			if (!followUpQuestion) {
				return null;
			}

			const triggerOption = config.triggerValue
				? question.options.find((option) => option.value === config.triggerValue)
				: null;
			const triggerLabel =
				config.triggerValue && question.choicesTranslationKey
					? translate(`${question.choicesTranslationKey}.${config.triggerValue}`)
					: config.triggerValue;

			return { ...config, followUpQuestion, triggerOption, triggerLabel };
		})
		.filter((item): item is NonNullable<typeof item> => Boolean(item));

	for (const followUp of resolvedFollowUps) {
		const triggerCount = followUp.triggerOption?.count ?? followUp.followUpQuestion.answeredCount;
		sections.push(
			<div
				key={`${question.name}-${followUp.childName}`}
				className="border-t border-slate-200 px-4 pt-5 pb-8 sm:px-6 sm:pt-6 sm:pb-10"
			>
				<div className="grid gap-6 lg:grid-cols-2">
					<div className="space-y-4 text-cyan-950">
						<p className="text-sm">
							{translate('survey.impactMeasurement.followUp.prefix')} {triggerCount}{' '}
							{translate('survey.impactMeasurement.followUp.individuals')}
							{followUp.triggerLabel ? (
								<>
									{' '}
									{translate('survey.impactMeasurement.followUp.whoSaid')}{' '}
									<span className="underline">{followUp.triggerLabel}</span>
								</>
							) : followUp.triggerDescription ? (
								<> {translate(followUp.triggerDescription)}</>
							) : null}
						</p>
						<h3 className="text-2xl leading-8 font-bold">{translate(followUp.followUpQuestion.translationKey)}</h3>
						<p className="text-sm">
							{followUp.followUpQuestion.answeredCount} {translate('survey.impactMeasurement.responsesIn')}{' '}
							<span className="underline decoration-dotted">
								{followUp.followUpQuestion.surveyCount} {translate('survey.impactMeasurement.surveys')}
							</span>
						</p>
					</div>
					<div className="space-y-3">
						<ImpactMeasurementQuestionContent
							question={followUp.followUpQuestion}
							keyPrefix={`${question.name}-${followUp.childName}`}
							lang={lang}
						/>
					</div>
				</div>
			</div>,
		);
		const nestedSections = await renderFollowUpSections({
			lang,
			question: followUp.followUpQuestion,
			questionsByName,
			followUpConfigs,
		});
		for (const nested of nestedSections) {
			sections.push(nested);
		}
	}

	return sections;
};

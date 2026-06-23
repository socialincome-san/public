import { Card } from '@/components/card';
import { SurveyImpactQuestion } from '@/lib/services/survey/survey-impact.types';
import { ReactNode } from 'react';
import { ImpactMeasurementQuestionContent } from './question-content';
import { getImpactTranslator } from './translator';

export const ImpactMeasurementQuestionCard = async ({
	lang,
	question,
	index,
	questionTypeLabelKey,
	followUpSections,
}: {
	lang: string;
	question: SurveyImpactQuestion;
	index: number;
	questionTypeLabelKey: string;
	followUpSections: ReactNode[];
}) => {
	const translator = await getImpactTranslator(lang);

	return (
		<div key={question.name} className="border-border bg-muted overflow-hidden rounded-3xl border shadow-sm">
			<Card variant="noPadding" className="border-border bg-card rounded-none border-b p-0 shadow-none">
				<div className="grid gap-6 px-4 pt-6 pb-8 sm:px-6 sm:pt-8 sm:pb-12 lg:grid-cols-2">
					<div className="space-y-5">
						<p className="text-foreground text-sm">
							{translator.t('survey.impactMeasurement.questionLabel').replace('{{number}}', String(index + 1))} (
							{translator.t(questionTypeLabelKey)})
						</p>
						<h2 className="text-foreground text-2xl leading-8 font-bold">{translator.t(question.translationKey)}</h2>
						<p className="text-foreground text-sm">
							{question.answeredCount} {translator.t('survey.impactMeasurement.responsesIn')}{' '}
							<span className="underline decoration-dotted">
								{question.surveyCount} {translator.t('survey.impactMeasurement.surveys')}
							</span>
						</p>
					</div>
					<div className="space-y-4">
						<ImpactMeasurementQuestionContent question={question} keyPrefix={question.name} lang={lang} />
					</div>
				</div>
				{followUpSections}
			</Card>
			{/* TODO: Render question-specific insights from CMS-managed content once available. */}
		</div>
	);
};

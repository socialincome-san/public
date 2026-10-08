import { type NamespaceMessageKey } from '@/lib/utils/message-keys';
import type { SurveyImpactQuestion } from '@/modules/surveys/survey.types';
import { getTranslations } from 'next-intl/server';
import { ReactNode } from 'react';
import { ImpactMeasurementQuestionContent } from './question-content';

export const ImpactMeasurementQuestionCard = async ({
	question,
	index,
	questionTypeLabelKey,
	followUpSections,
}: {
	question: SurveyImpactQuestion;
	index: number;
	questionTypeLabelKey: NamespaceMessageKey<'website-survey'>;
	followUpSections: ReactNode[];
}) => {
	const t = await getTranslations('website-survey');

	return (
		<div key={question.name} className="border-border bg-muted overflow-hidden rounded-3xl border shadow-sm">
			<div className="border-border bg-card border-b">
				<div className="grid gap-6 px-4 pt-6 pb-8 sm:px-6 sm:pt-8 sm:pb-12 lg:grid-cols-2">
					<div className="space-y-5">
						<p className="text-foreground text-sm">
							{t('survey.impactMeasurement.questionLabel', { number: index + 1 })} ({t(questionTypeLabelKey)})
						</p>
						<h2 className="text-foreground text-2xl leading-8 font-bold">{t(question.translationKey)}</h2>
						<p className="text-foreground text-sm">
							{question.answeredCount} {t('survey.impactMeasurement.responsesIn')}{' '}
							<span className="underline decoration-dotted">
								{question.surveyCount} {t('survey.impactMeasurement.surveys')}
							</span>
						</p>
					</div>
					<div className="space-y-4">
						<ImpactMeasurementQuestionContent question={question} keyPrefix={question.name} />
					</div>
				</div>
				{followUpSections}
			</div>
			{/* TODO: Render question-specific insights from CMS-managed content once available. */}
		</div>
	);
};

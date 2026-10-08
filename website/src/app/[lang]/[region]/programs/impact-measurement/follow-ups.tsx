import { isMessageKey, type NamespaceMessageKey } from '@/lib/utils/message-keys';
import type { SurveyImpactQuestion } from '@/modules/surveys/survey.types';
import { getMessages, getTranslations } from 'next-intl/server';
import { ReactNode } from 'react';
import { ImpactMeasurementQuestionContent } from './question-content';

type FollowUpConfig = {
	childName: string;
	triggerValue?: string;
	triggerDescription?: NamespaceMessageKey<'website-survey'>;
};

export const renderFollowUpSections = async ({
	question,
	questionsByName,
	followUpConfigs,
}: {
	question: SurveyImpactQuestion;
	questionsByName: Map<string, SurveyImpactQuestion>;
	followUpConfigs: Record<string, FollowUpConfig[]>;
}): Promise<ReactNode[]> => {
	const [t, messages] = await Promise.all([getTranslations('website-survey'), getMessages()]);
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
			const triggerKey =
				config.triggerValue && question.choicesTranslationKey
					? `${question.choicesTranslationKey}.${config.triggerValue}`
					: undefined;
			const triggerLabel =
				triggerKey === undefined
					? config.triggerValue
					: isMessageKey(messages, 'website-survey', triggerKey)
						? t(triggerKey)
						: triggerKey;

			return { ...config, followUpQuestion, triggerOption, triggerLabel };
		})
		.filter((item): item is NonNullable<typeof item> => Boolean(item));

	for (const followUp of resolvedFollowUps) {
		const triggerCount = followUp.triggerOption?.count ?? followUp.followUpQuestion.answeredCount;
		sections.push(
			<div
				key={`${question.name}-${followUp.childName}`}
				className="border-border border-t px-4 pt-5 pb-8 sm:px-6 sm:pt-6 sm:pb-10"
			>
				<div className="grid gap-6 lg:grid-cols-2">
					<div className="text-foreground space-y-4">
						<p className="text-sm">
							{t('survey.impactMeasurement.followUp.prefix')} {triggerCount}{' '}
							{t('survey.impactMeasurement.followUp.individuals')}
							{followUp.triggerLabel ? (
								<>
									{' '}
									{t('survey.impactMeasurement.followUp.whoSaid')} <span className="underline">{followUp.triggerLabel}</span>
								</>
							) : followUp.triggerDescription ? (
								<> {t(followUp.triggerDescription)}</>
							) : null}
						</p>
						<h3 className="text-2xl leading-8 font-bold">{t(followUp.followUpQuestion.translationKey)}</h3>
						<p className="text-sm">
							{followUp.followUpQuestion.answeredCount} {t('survey.impactMeasurement.responsesIn')}{' '}
							<span className="underline decoration-dotted">
								{followUp.followUpQuestion.surveyCount} {t('survey.impactMeasurement.surveys')}
							</span>
						</p>
					</div>
					<div className="space-y-3">
						<ImpactMeasurementQuestionContent
							question={followUp.followUpQuestion}
							keyPrefix={`${question.name}-${followUp.childName}`}
						/>
					</div>
				</div>
			</div>,
		);
		const nestedSections = await renderFollowUpSections({
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

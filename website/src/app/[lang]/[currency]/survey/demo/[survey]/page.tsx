'use client';

import { SurveyQuestionnaire } from '@/generated/prisma/enums';
import { useMessages, useTranslations } from 'next-intl';
import { use } from 'react';
import { Model } from 'survey-core';
import 'survey-core/survey-core.min.css';
import { BorderlessLightPanelless } from 'survey-core/themes';
import { Survey as SurveyReact } from 'survey-react-ui';
import { settings } from '../../[recipient]/[survey]/common';
import { getQuestionnaire } from '../../[recipient]/[survey]/questionnaires';

type DemoSurveyId = 'onboarding' | 'checkin' | 'offboarding' | 'followup';

type DemoSurveyPageProps = {
	params: Promise<{
		survey: string;
	}>;
};

const DEMO_SURVEYS: Record<
	DemoSurveyId,
	{ questionnaire: SurveyQuestionnaire; titleKey: 'titleOnboarding' | 'titleCheckin' | 'titleOffboarding' | 'titleFollowup' }
> = {
	onboarding: {
		questionnaire: SurveyQuestionnaire.onboarding,
		titleKey: 'titleOnboarding',
	},
	checkin: {
		questionnaire: SurveyQuestionnaire.checkin,
		titleKey: 'titleCheckin',
	},
	offboarding: {
		questionnaire: SurveyQuestionnaire.offboarding,
		titleKey: 'titleOffboarding',
	},
	followup: {
		questionnaire: SurveyQuestionnaire.offboarded_checkin,
		titleKey: 'titleFollowup',
	},
};

const isDemoSurveyId = (value: string): value is DemoSurveyId => value in DEMO_SURVEYS;

export default function Page({ params }: DemoSurveyPageProps) {
	const { survey } = use(params);
	const t = useTranslations('website-survey');
	const messages = useMessages();

	if (!isDemoSurveyId(survey)) {
		return (
			<div className="text-destructive bg-destructive-foreground mx-auto max-w-md rounded-2xl px-5 py-4 text-sm">
				Unknown demo survey.
			</div>
		);
	}

	const demoSurvey = DEMO_SURVEYS[survey];
	const model = new Model({
		...settings(t),
		pages: getQuestionnaire(demoSurvey.questionnaire, t, messages, 'Demo Recipient'),
	});
	model.applyTheme(BorderlessLightPanelless);

	return (
		<section className="w-site-width max-w-content mx-auto px-4 py-6 sm:py-10 lg:py-14">
			<div className="bg-card/95 ring-foreground/5 shadow-overlay overflow-hidden rounded-4xl ring-1 backdrop-blur">
				<div className="px-4 py-6 sm:px-8 sm:py-8 lg:px-10">
					<div className="mb-6 space-y-2">
						<h1 className="text-3xl font-bold tracking-tight">{t(demoSurvey.titleKey)}</h1>
						<p className="text-muted-foreground text-sm">{t('demo')}</p>
					</div>
					<SurveyReact model={model} />
				</div>
			</div>
		</section>
	);
}

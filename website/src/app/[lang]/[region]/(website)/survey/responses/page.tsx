import { DefaultPageProps } from '@/app/[lang]/[region]';
import BarchartSurveyResponseComponent, {
	ChartData,
} from '@/app/[lang]/[region]/(website)/survey/responses/barchart-survey-response-component';
import { firestoreAdmin } from '@/firebase-admin';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import { QuestionInputType } from '@socialincome/shared/src/types/question';
import { SurveyQuestionnaire } from '@socialincome/shared/src/types/survey';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { SurveyAnswersByType, SurveyStatsCalculator } from '@socialincome/shared/src/utils/stats/SurveyStatsCalculator';
import {
	Badge,
	BaseContainer,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Separator,
	Typography,
} from '@socialincome/ui';
import { Fragment } from 'react';
import './card-tab.css';

export const revalidate = 3600; // update once an hour
export default async function Page({ params: { lang } }: DefaultPageProps) {
	const surveyStatsCalculator = await SurveyStatsCalculator.build(firestoreAdmin);
	const temp = surveyStatsCalculator.data;
	const allSurveyData = Object.values(SurveyQuestionnaire)
		.map((it) => temp.find((survey) => survey.type == it))
		.filter((it) => !!it);
	const data = surveyStatsCalculator.aggregatedData;
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-responses', 'website-survey'],
	});

	function convertToBarchartData(surveyAnswersByType: SurveyAnswersByType): ChartData[] {
		return Object.values(surveyAnswersByType.question.choices)
			.map((key) => ({
				name: translator.t(surveyAnswersByType.question.choicesTranslationKey! + '.' + key),
				value: Math.round(((surveyAnswersByType.answers[key] || 0) / surveyAnswersByType.total) * 100),
			}))
			.sort((a, b) => b.value - a.value);
	}

	return (
		<BaseContainer className="mx-auto flex flex-col">
			<Typography size="4xl" className="mt-4" weight="bold">
				{translator.t('title')}
			</Typography>

			<Typography size="xl" className="mx-2 mt-8" weight="bold">
				{translator.t('select-survey')}
			</Typography>
			<Tabs defaultValue={SurveyQuestionnaire.Onboarding}>
				<TabsList className="mx-auto mt-2 grid grid-cols-1 gap-2 lg:grid-cols-4">
					{allSurveyData.map(
						(surveyData) =>
							surveyData && (
								<TabsTrigger key={surveyData.type} value={surveyData.type} className="tabs-trigger" asChild={true}>
									<Card className="card-tab data-[state=active]:bg-primary bg-card-muted data-[state=active]:cursor-default data-[state=inactive]:cursor-pointer data-[state=active]:text-white">
										<CardHeader className={'pb-2 pl-4 pt-2'}>
											<CardTitle className="card-tab-title py-2">{translator.t(surveyData.type + '.title')}</CardTitle>
										</CardHeader>
										<CardContent className={'p-2 pl-4'}>
											<Typography>{translator.t(surveyData.type + '.description')}</Typography>
											<Typography className="mt-3">
												{surveyData.total} {translator.t('data-points')}
											</Typography>
										</CardContent>
									</Card>
								</TabsTrigger>
							),
					)}
				</TabsList>
				<Typography className="mt-10 font-bold">
					{translator.t('responses-since', {
						context: { sinceDate: surveyStatsCalculator.oldestDate.toLocaleDateString() },
					})}
				</Typography>
				{Object.values(SurveyQuestionnaire).map((selectedSurvey) => (
					<TabsContent value={selectedSurvey} key={selectedSurvey}>
						<div className="mx-auto grid grid-cols-1 gap-2 lg:grid-cols-2">
							{Object.keys(data[selectedSurvey] || []).map((key) => (
								<Fragment key={selectedSurvey + key + 'statistics'}>
									<Separator className="col-span-1 mt-2 lg:col-span-2"></Separator>
									<div key={selectedSurvey + key + 'question'} className="columns-1 bg-transparent p-2">
										<Typography size="2xl" className="text py-2" weight="bold">
											{translator.t(data[selectedSurvey][key].question.translationKey)}
											{data[selectedSurvey][key].question.type == QuestionInputType.CHECKBOX && (
												<Typography className="text-sm">({translator.t('multiple-answers')})</Typography>
											)}
										</Typography>

										<Badge variant="accent">
											<Typography>
												{data[selectedSurvey][key].total} {translator.t('answers')}
											</Typography>
										</Badge>
									</div>
									<div key={selectedSurvey + key + 'answers'} className="w-full p-2">
										{data[selectedSurvey][key].answers && (
											<BarchartSurveyResponseComponent
												data={convertToBarchartData(data[selectedSurvey][key])}
											></BarchartSurveyResponseComponent>
										)}
									</div>
								</Fragment>
							))}
						</div>
					</TabsContent>
				))}
			</Tabs>
			<Separator></Separator>
		</BaseContainer>
	);
}
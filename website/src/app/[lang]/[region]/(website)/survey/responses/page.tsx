import { DefaultPageProps } from '@/app/[lang]/[region]';
import BarchartSurveyResponseComponent, {
	ChartData,
} from '@/app/[lang]/[region]/(website)/survey/responses/barchart-survey-response-component';
import { firestoreAdmin } from '@/firebase-admin';
import { QuestionInputType } from '@socialincome/shared/src/types/question';
import { SurveyQuestionnaire } from '@socialincome/shared/src/types/survey';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { SurveyAnswersByType, SurveyStatsCalculator } from '@socialincome/shared/src/utils/stats/SurveyStatsCalculator';
import {
	Badge,
	BaseContainer,
	Card,
	CardTitle,
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
	Typography,
} from '@socialincome/ui';
import { Fragment } from 'react';

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
				<TabsList className="mx-auto mt-2 grid grid-cols-1 lg:grid-cols-4">
					{allSurveyData.map(
						(surveyData) =>
							surveyData && (
								<TabsTrigger key={surveyData.type} value={surveyData.type} className="tabs-trigger" asChild={true}>
									<Card className="data-[state=active]:bg-primary ml-1 bg-neutral-50 p-2 data-[state=inactive]:cursor-pointer data-[state=active]:text-white">
										<CardTitle className="text py-2">{translator.t(surveyData.type + '.title')}</CardTitle>
										<Typography className="mt-2">{translator.t(surveyData.type + '.description')}</Typography>
										<Typography className="mt-3">
											{surveyData.total} {translator.t('data-points')}
										</Typography>
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
									<hr className="border-primary col-span-1 mt-5 w-full lg:col-span-2"></hr>
									<div key={selectedSurvey + key + 'question'} className="columns-1 bg-transparent p-2">
										<Typography size="2xl" className="text py-2" weight="bold">
											{translator.t(data[selectedSurvey][key].question.translationKey)}
											{data[selectedSurvey][key].question.type == QuestionInputType.CHECKBOX && (
												<Typography className="text-sm">({translator.t('multiple-answers')})</Typography>
											)}
										</Typography>

										<Badge className="bg-accent text-center font-medium text-gray-700">
											<Typography className="mt-1">
												{data[selectedSurvey][key].total} {translator.t('answers')}
											</Typography>
										</Badge>
									</div>
									<div key={selectedSurvey + key + 'answers'} className="w-full columns-1 bg-transparent p-2">
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
			<hr className="border-primary col-span-1 mt-5 w-full lg:col-span-2"></hr>
		</BaseContainer>
	);
}

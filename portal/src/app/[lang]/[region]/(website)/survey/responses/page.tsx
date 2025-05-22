import { DefaultPageProps } from '@/app/[lang]/[region]';
import BarchartSurveyResponseComponent, {
	ChartData,
} from '@/app/[lang]/[region]/(website)/survey/responses/barchart-survey-response-component';
import { firestoreAdmin } from '@/firebase-admin';
import { ClockIcon, ViewfinderCircleIcon } from '@heroicons/react/24/outline';
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

export const revalidate = 3600; // update once an hour

export default async function Page(props: DefaultPageProps) {
	const params = await props.params;

	const { lang } = params;

	const { aggregatedData: data, oldestDate } = await SurveyStatsCalculator.build(firestoreAdmin);
	const activeSurveyIndexes: Record<SurveyQuestionnaire, { from: number; to: number }> = {
		[SurveyQuestionnaire.Onboarding]: { from: 0, to: 0 },
		[SurveyQuestionnaire.Checkin]: { from: 1, to: 5 },
		[SurveyQuestionnaire.Offboarding]: { from: 6, to: 6 },
		[SurveyQuestionnaire.OffboardedCheckin]: { from: 7, to: 10 },
	};

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
			<Typography size="4xl" className="my-4" weight="bold">
				{translator.t('title')}
			</Typography>
			<Tabs defaultValue={SurveyQuestionnaire.Onboarding}>
				<TabsList className="mx-auto mb-10 mt-2 grid grid-cols-2 gap-2 lg:grid-cols-4">
					{Object.values(SurveyQuestionnaire).map(
						(surveyQuestionnaireType) =>
							data[surveyQuestionnaireType] && (
								<TabsTrigger key={surveyQuestionnaireType} value={surveyQuestionnaireType} asChild={true}>
									<Card className="card-tab data-[state=active]:bg-primary [&_h3]:data-[state=inactive]: hover:bg-primary hover:bg-opacity-10 data-[state=active]:cursor-default data-[state=inactive]:cursor-pointer data-[state=active]:text-white">
										<CardHeader className="pb-0 pl-5">
											<CardTitle>{translator.t(`${surveyQuestionnaireType}.title`)}</CardTitle>
										</CardHeader>
										<CardContent className="flex items-center pl-5 pt-4">
											{/* Viewfinder Icon */}
											<ViewfinderCircleIcon className="mr-2 h-5 w-5 group-data-[state=active]:text-white" />
											{/* Data Points Text */}
											<Typography>
												{data[surveyQuestionnaireType].totalAnswersForAllQuestions} {translator.t('data-points')}
											</Typography>
										</CardContent>
									</Card>
								</TabsTrigger>
							),
					)}
				</TabsList>
				{Object.values(SurveyQuestionnaire).map((selectedSurvey) => (
					<TabsContent value={selectedSurvey} key={selectedSurvey}>
						<div className="mx-auto mb-5 mt-20">
							<div className="w-full text-left">
								<Typography size="3xl" weight="bold" className="mb-4">
									{translator.t(`${selectedSurvey}.title`)}
								</Typography>
							</div>
							<div className="grid w-full grid-cols-1 items-stretch gap-2 md:grid-cols-2">
								<div className="flex items-center justify-start text-left">
									<ClockIcon className="text-primary mr-2 h-5 w-5" />
									<Typography>{translator.t(`${selectedSurvey}.description`)}</Typography>
								</div>
								<div className="flex items-center justify-start text-left md:justify-end md:text-right">
									<Typography>
										{translator.t('responses-since', {
											context: {
												completedSurveys: data[selectedSurvey].completedSurveys,
												sinceDate: oldestDate.toLocaleDateString(),
											},
										})}
									</Typography>
								</div>
							</div>
						</div>
						<div className="px-0 py-8">
							<div className="relative">
								<div className="bg-border absolute top-1/2 h-0.5 w-full -translate-y-1/2 transform" />
								<div className="relative flex justify-between">
									{Array.from({ length: 11 }).map((_, index) => (
										<div
											key={index}
											className={`h-6 w-6 rounded-full border-2 ${
												index >= activeSurveyIndexes[selectedSurvey].from &&
												index <= activeSurveyIndexes[selectedSurvey].to
													? 'bg-accent border-accent'
													: 'bg-background border-border'
											}`}
										/>
									))}
								</div>
							</div>
						</div>

						<div className="mx-auto grid grid-cols-1 gap-2 lg:grid-cols-2">
							{Object.keys(data[selectedSurvey]?.answersByQuestionType || {}).map((questionKey) => (
								<Fragment key={`${selectedSurvey}-${questionKey}statistics`}>
									<Separator className="col-span-1 mt-2 lg:col-span-2" />
									<div key={`${selectedSurvey}-${questionKey}-question`} className="py-2">
										<Typography size="2xl" weight="medium" className="my-2">
											{translator.t(data[selectedSurvey].answersByQuestionType[questionKey].question.translationKey)}
											{data[selectedSurvey].answersByQuestionType[questionKey].question.type ==
												QuestionInputType.CHECKBOX && (
												<Typography size="sm" weight="normal">
													({translator.t('multiple-answers')})
												</Typography>
											)}
										</Typography>
										<Badge variant="accent" className="font-normal">
											<Typography>
												{data[selectedSurvey].answersByQuestionType[questionKey].total} {translator.t('answers')}
											</Typography>
										</Badge>
									</div>
									<div key={`${selectedSurvey}-${questionKey}-answers`} className="py-2">
										{data[selectedSurvey].answersByQuestionType[questionKey].answers && (
											<BarchartSurveyResponseComponent
												data={convertToBarchartData(data[selectedSurvey].answersByQuestionType[questionKey])}
											/>
										)}
									</div>
								</Fragment>
							))}
						</div>
					</TabsContent>
				))}
			</Tabs>
			<Separator />
		</BaseContainer>
	);
}

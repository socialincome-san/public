import { getCountryRecipients, getPaidOutFigure } from '@/components/public-figures/public-figures';
import type { Timeline, TimelineStep } from '@/generated/storyblok/types/109655/storyblok-components';
import { resultOk } from '@/lib/result';
import { getSurveyImpactMeasurementsAction } from '@/modules/surveys/survey.actions';
import type { SurveyImpactData } from '@/modules/surveys/survey.types';
import { renderToStaticMarkup } from 'react-dom/server';
import { TimelineBlock } from './timeline';

jest.mock('@/components/public-figures/public-figures', () => ({
	getPaidOutFigure: jest.fn(),
	getCountryRecipients: jest.fn(),
}));

jest.mock('@/modules/surveys/survey.actions', () => ({
	getSurveyImpactMeasurementsAction: jest.fn(),
}));

jest.mock('@/components/storyblok-markdown', () => ({
	StoryblokMarkdown: ({ children }: { children: string }) => children,
}));

jest.mock('@storyblok/react', () => ({
	storyblokEditable: jest.fn(() => ({})),
}));

const step = (fields: Partial<TimelineStep>): TimelineStep => ({
	component: 'timelineStep',
	_uid: fields.title ?? 'step',
	title: 'Step',
	...fields,
});

const renderTimeline = async (steps: TimelineStep[]) => {
	const blok: Timeline = { component: 'timeline', _uid: 'timeline', steps };

	return renderToStaticMarkup(await TimelineBlock({ blok, lang: 'en', currency: 'CHF' }));
};

const impact = (answeredCount: number, happierPercentage: number): SurveyImpactData => ({
	totalCompletedSurveys: answeredCount,
	totalRecipients: answeredCount,
	totalCountries: 1,
	totalPrograms: 1,
	totalQuestionnaires: 1,
	questions: [
		{
			name: 'happierV1',
			inputType: 'radiogroup',
			translationKey: 'survey.questions.happierTitleV1',
			questionnaires: ['checkin'],
			answeredCount,
			surveyCount: answeredCount,
			options: [{ value: 'true', count: 0, percentage: happierPercentage }],
		},
	],
});

beforeEach(() => jest.clearAllMocks());

test('keeps a badge without a live figure as it is', async () => {
	const markup = await renderTimeline([step({ title: 'You donate', badge: 'Cancel anytime' })]);

	expect(markup).toContain('Cancel anytime');
	expect(getPaidOutFigure).not.toHaveBeenCalled();
});

test('puts the live figure in front of the badge text', async () => {
	jest.mocked(getPaidOutFigure).mockResolvedValue('CHF 1.2M');

	const markup = await renderTimeline([step({ badge: 'paid out so far', badgeFigure: 'paidOut' })]);

	expect(markup).toContain('CHF 1.2M paid out so far');
});

test('hides a badge while its live figure is not available', async () => {
	jest.mocked(getPaidOutFigure).mockResolvedValue(undefined);

	const markup = await renderTimeline([step({ badge: 'paid out so far', badgeFigure: 'paidOut' })]);

	expect(markup).not.toContain('paid out so far');
});

test('adds up the recipients of all country pages', async () => {
	jest.mocked(getCountryRecipients).mockResolvedValue([
		{ uuid: 'sl', isoCode: 'SL', recipients: 60 },
		{ uuid: 'lr', isoCode: 'LR', recipients: 42 },
		{ uuid: 'gh', isoCode: 'GH', recipients: undefined },
	]);

	const markup = await renderTimeline([step({ badge: 'people in our programs', badgeFigure: 'recipients' })]);

	expect(markup).toContain('102 people in our programs');
});

test('shows the happier share only once recipients have answered', async () => {
	const badge = step({ badge: 'feel happier', badgeFigure: 'happier' });

	jest.mocked(getSurveyImpactMeasurementsAction).mockResolvedValue(resultOk(impact(0, 0)));
	expect(await renderTimeline([badge])).not.toContain('feel happier');

	jest.mocked(getSurveyImpactMeasurementsAction).mockResolvedValue(resultOk(impact(10, 50)));
	expect(await renderTimeline([badge])).toContain('50% feel happier');
});

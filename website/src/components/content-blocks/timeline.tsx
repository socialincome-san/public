import { blockMargins } from '@/components/content-blocks/block-margins';
import { OUTFLOW_REACH_PERCENT } from '@/components/outflows/outflows-spend';
import { getCountryRecipients, getPaidOutFigure } from '@/components/public-figures/public-figures';
import { StoryblokMarkdown } from '@/components/storyblok-markdown';
import type { Timeline, TimelineStep } from '@/generated/storyblok/types/109655/storyblok-components';
import { getSafeNumberFormatLocale, type WebsiteCurrency, type WebsiteLanguage } from '@/lib/i18n/utils';
import { formatNumberLocale } from '@/lib/utils/string-utils';
import { getSurveyImpactMeasurementsAction } from '@/modules/surveys/survey.actions';
import { Timeline as TimelineView } from '@socialincome/design-system/data-display/timeline/timeline';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { storyblokEditable } from '@storyblok/react';

type Props = {
	blok: Timeline;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
};

type BadgeFigure = Exclude<NonNullable<TimelineStep['badgeFigure']>, ''>;

const HAPPIER_QUESTION = 'happierV1';

const loadRecipients = async (lang: WebsiteLanguage, locale: string) => {
	const countries = await getCountryRecipients(lang);
	const count = countries.reduce((total, country) => total + (country.recipients ?? 0), 0);

	return count > 0 ? formatNumberLocale(count, locale) : undefined;
};

const loadHappierShare = async (locale: string) => {
	const impact = await getSurveyImpactMeasurementsAction();
	const question = impact.success ? impact.data.questions.find(({ name }) => name === HAPPIER_QUESTION) : undefined;
	const share = question?.answeredCount ? question.options.find(({ value }) => value === 'true')?.percentage : undefined;

	return share === undefined ? undefined : formatPercent(share, locale);
};

const formatPercent = (percent: number, locale: string) =>
	new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0 }).format(percent / 100);

const loadFigure = async (figure: BadgeFigure, lang: WebsiteLanguage, currency: WebsiteCurrency) => {
	const locale = getSafeNumberFormatLocale(lang);

	switch (figure) {
		case 'paidOut':
			return getPaidOutFigure(lang, currency);
		case 'recipients':
			return loadRecipients(lang, locale);
		case 'happier':
			return loadHappierShare(locale);
		case 'reach':
			return formatPercent(OUTFLOW_REACH_PERCENT, locale);
	}
};

// A badge with a live figure stays hidden while the figure is not available
const getBadge = async (step: TimelineStep, lang: WebsiteLanguage, currency: WebsiteCurrency) => {
	const text = step.badge?.trim();
	if (!step.badgeFigure) {
		return text;
	}
	const figure = await loadFigure(step.badgeFigure, lang, currency);

	return figure ? [figure, text].filter(Boolean).join(' ') : undefined;
};

export const TimelineBlock = async ({ blok, lang, currency }: Props) => {
	const steps = (blok.steps ?? []).filter((step) => step.title?.trim());
	if (steps.length === 0) {
		return null;
	}
	const items = await Promise.all(
		steps.map(async (step) => ({
			id: step._uid,
			title: step.title,
			description: step.description,
			eyebrow: step.eyebrow,
			imageSrc: step.image?.filename ?? undefined,
			badge: await getBadge(step, lang, currency),
		})),
	);

	return (
		<BlockWrapper {...blockMargins(blok)} {...storyblokEditable(blok)}>
			<TimelineView
				title={blok.title?.trim() ? <StoryblokMarkdown>{blok.title}</StoryblokMarkdown> : undefined}
				description={blok.description}
				items={items}
			/>
		</BlockWrapper>
	);
};

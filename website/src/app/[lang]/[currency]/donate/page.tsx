import { DefaultLayoutProps } from '@/app/[lang]/[currency]';
import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { FaqSelectionContent } from '@/components/content-blocks/faq-selection-content';
import { DonateAmountProvider } from '@/components/donate/donate-amount-context';
import { DonateCalculator } from '@/components/donate/donate-calculator';
import { getDonationExplainerVideo } from '@/components/donation-wizard/utils/donation-explainer-video';
import { ExplainerVideoTrigger } from '@/components/explainer-video/explainer-video-trigger';
import { OUTFLOW_REACH_PERCENT } from '@/components/outflows/outflows-spend';
import { getProgramPortalSlug } from '@/components/storyblok/program/program.utils';
import { ProgramsOverview } from '@/components/storyblok/program/programs-overview';
import type { StoryblokRichtext } from '@/generated/storyblok/types/storyblok';
import { getSafeNumberFormatLocale, isWebsiteLanguage, toWebsiteCurrency } from '@/lib/i18n/utils';
import { getWebsitePublicPath } from '@/lib/storyblok/storyblok-paths';
import { formatCurrencyLocale, formatNumberLocale } from '@/lib/utils/string-utils';
import { getPublicCountryStatsByIsoCodes } from '@/modules/countries/country.cache';
import { resolveChfAmounts } from '@/modules/currency-display/currency-display.cache';
import { getPublicProgramStatsByProgramPortalSlugs } from '@/modules/programs/program.cache';
import { getPrograms } from '@/modules/storyblok-content/storyblok-content.cache';
import { getSurveyImpactMeasurements } from '@/modules/surveys/survey.cache';
import { getTransparencySummary } from '@/modules/transparency/transparency.cache';
import { Button } from '@socialincome/design-system/actions/button/button';
import { Timeline } from '@socialincome/design-system/data-display/timeline/timeline';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { PageIntro } from '@socialincome/design-system/layout/page-intro/page-intro';
import { SectionHeading } from '@socialincome/design-system/layout/section-heading/section-heading';
import { ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import NextLink from 'next/link';
import { type ReactNode } from 'react';

const FAQ = ['why-one-percent', 'cancel', 'tax'] as const;
const PROGRAM_COUNTRY_CODES = ['SL', 'LR', 'GH'];
const HAPPIER_QUESTION = 'happierV1';
const ACTIVE_PROGRAMS_SHOWN = 3;

// The site's FAQ display renders Storyblok rich text; these answers come from the translations
const toRichText = (text: string): StoryblokRichtext => ({
	type: 'doc',
	content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
});

export const generateMetadata = async () => {
	const t = await getTranslations('website-donate.page');

	return { title: `${t('breadcrumb')} | Social Income` };
};

export default async function DonateRoute({ params }: DefaultLayoutProps) {
	const { lang, currency } = await params;
	const websiteCurrency = toWebsiteCurrency(currency);
	const language = isWebsiteLanguage(lang) ? lang : 'en';
	const locale = getSafeNumberFormatLocale(language);
	const [t, tCommon, tFaq, countryStats, transparency, programs, impact] = await Promise.all([
		getTranslations('website-donate.page'),
		getTranslations('website-common'),
		getTranslations('website-faq'),
		getPublicCountryStatsByIsoCodes(PROGRAM_COUNTRY_CODES),
		getTransparencySummary(),
		getPrograms(lang),
		getSurveyImpactMeasurements(),
	]);
	const paidOut = transparency.success
		? await resolveChfAmounts({
				amounts: [transparency.data.financialSummary.outflowsChf],
				displayCurrency: websiteCurrency,
			})
		: undefined;
	const paidOutAmount = paidOut?.success ? paidOut.data[0] : undefined;
	const recipientsCount = countryStats.success
		? Object.values(countryStats.data).reduce((total, stats) => total + stats.recipientsCount, 0)
		: 0;

	const format = (value: number) => formatNumberLocale(value, locale);
	const formatPercent = (value: number) => `${Math.round(value)}\u202f%`;
	const strong = (chunks: ReactNode) => <strong>{chunks}</strong>;
	const path = (tail: string) => getWebsitePublicPath(lang, websiteCurrency, tail);
	const video = getDonationExplainerVideo(language);

	const programList = programs.success ? programs.data : [];
	const programPortalSlugs = [
		...new Set(programList.map((program) => getProgramPortalSlug(program.content)).filter(Boolean)),
	];
	const programStatsResult = await getPublicProgramStatsByProgramPortalSlugs(programPortalSlugs);
	const programStats = programStatsResult.success ? programStatsResult.data : {};
	const recipientsOf = (program: (typeof programList)[number]) =>
		programStats[getProgramPortalSlug(program.content)]?.recipientsCount ?? 0;
	// Programs that currently pay out an income, the largest first
	const activePrograms = programList
		.filter((program) => recipientsOf(program) > 0)
		.sort((a, b) => recipientsOf(b) - recipientsOf(a))
		.slice(0, ACTIVE_PROGRAMS_SHOWN);

	const impactQuestions = impact.success ? impact.data.questions : [];
	const happier = impactQuestions
		.find((question) => question.name === HAPPIER_QUESTION)
		?.options.find((option) => option.value === 'true');

	return (
		<DonateAmountProvider>
			<div className="flex flex-col gap-8 py-8">
				<Breadcrumb
					layout="section"
					links={[
						{ href: path(''), label: tCommon('breadcrumb.home') },
						{ href: '', label: t('breadcrumb') },
					]}
				/>
				<BlockWrapper marginTop="none" marginBottom="none">
					<div className="flex w-full flex-col gap-24 md:gap-32">
						<div className="flex flex-col gap-12 md:gap-16">
							<PageIntro
								title={t.rich('title', { strong })}
								description={t('description', { percent: OUTFLOW_REACH_PERCENT })}
								illustrationSrc="/assets/donate/donate-bike.png"
								actions={
									<ExplainerVideoTrigger
										layout="inline"
										label={t('why-one-percent')}
										embedUrl={video.embedUrl}
										thumbnailSrc={video.thumbnailSrc}
										thumbnailAlt={t('why-one-percent')}
										dialogTitle={t('why-one-percent')}
									/>
								}
							/>
							<DonateCalculator />
						</div>

						{/* 2. Does the money really arrive? */}
						<Timeline
							title={t.rich('path-title', { strong })}
							description={t('path.intro')}
							items={[
								{
									eyebrow: t('path.place-donor'),
									title: t('path.donate-title'),
									text: t('path.donate-text'),
									proof: t('path.donate-proof'),
									imageSrc: '/assets/donate/timeline-1.webp',
								},
								{
									eyebrow: t('path.place-org'),
									title: t('path.forward-title'),
									text: t('path.forward-text'),
									proof: t('path.forward-proof', { percent: OUTFLOW_REACH_PERCENT }),
									imageSrc: '/assets/donate/timeline-2.webp',
								},
								{
									eyebrow: t('path.place-recipients'),
									title: t('path.phone-title'),
									text: t('path.phone-text'),
									proof: paidOutAmount
										? t('path.phone-proof', {
												amount: formatCurrencyLocale(paidOutAmount.amount, paidOutAmount.currency, locale, {
													compactThreshold: 10_000,
												}),
											})
										: undefined,
									imageSrc: '/assets/donate/timeline-3.webp',
								},
								{
									eyebrow: t('path.place-recipients'),
									title: t('path.decide-title'),
									text: t('path.decide-text'),
									proof: recipientsCount > 0 ? t('path.decide-proof', { count: format(recipientsCount) }) : undefined,
									imageSrc: '/assets/donate/timeline-4.webp',
								},
								{
									eyebrow: t('path.place-recipients'),
									title: t('path.survey-title'),
									text: t('path.survey-text'),
									proof: happier ? t('path.survey-proof', { percent: formatPercent(happier.percentage) }) : undefined,
									imageSrc: '/assets/donate/timeline-5.webp',
								},
							]}
						/>

						{/* Which programs does my money go to? */}
						{activePrograms.length > 0 ? (
							<section className="flex flex-col gap-10">
								<div className="flex flex-wrap items-end justify-between gap-6">
									<SectionHeading align="left">{t.rich('who-title', { strong })}</SectionHeading>
									<Button variant="outline" asChild>
										<NextLink href={path('programs')}>
											{t('programs-link')}
											<ArrowRight />
										</NextLink>
									</Button>
								</div>
								<ProgramsOverview
									programs={activePrograms}
									statsByPortalSlug={programStats}
									lang={language}
									currency={websiteCurrency}
								/>
							</section>
						) : null}

						{/* What if …? */}
						<div className="pb-12">
							<FaqSelectionContent
								heading={tFaq('title')}
								items={FAQ.map((item) => ({
									id: item,
									question: toRichText(t(`faq.${item}-q`)),
									answer: toRichText(t(`faq.${item}-a`)),
								}))}
								cta={{ href: path('faq'), label: t('all-questions') }}
							/>
						</div>
					</div>
				</BlockWrapper>
			</div>
		</DonateAmountProvider>
	);
}

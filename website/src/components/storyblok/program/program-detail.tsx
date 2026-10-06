import { buildTeaserAvatars, loadBehindTheScenesData } from '@/components/behind-the-scenes/behind-the-scenes-data';
import { BehindTheScenesPanel } from '@/components/behind-the-scenes/behind-the-scenes-panel';
import { BehindTheScenesProvider } from '@/components/behind-the-scenes/behind-the-scenes-provider';
import { BehindTheScenesTeaser } from '@/components/behind-the-scenes/behind-the-scenes-teaser';
import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { buildBreadcrumbLinks } from '@/components/breadcrumb/build-breadcrumb-links';
import { CampaignJournalTeaser } from '@/components/campaign/campaign-journal-teaser';
import { FaqSelectionContent } from '@/components/content-blocks/faq-selection-content';
import { resolveFaqItems } from '@/components/content-blocks/faq-selection.utils';
import { DonationFormServer } from '@/components/donation-wizard/donation-form-server';
import { resolveProgramCountry } from '@/components/storyblok/country/resolve-country-name';
import type { ProgramDetailData } from '@/components/storyblok/program/load-program-detail-data';
import { ProgramAbout } from '@/components/storyblok/program/program-about';
import { ProgramCountry } from '@/components/storyblok/program/program-country';
import { ProgramDetailRelatedGrid } from '@/components/storyblok/program/program-detail-related-grid';
import { ProgramFinances } from '@/components/storyblok/program/program-finances';
import { ProgramPayoutsTotal } from '@/components/storyblok/program/program-payouts-total';
import { ProgramRecipients } from '@/components/storyblok/program/program-recipients';
import { ProgramSurveys } from '@/components/storyblok/program/program-surveys';
import { HeroHeader } from '@/components/storyblok/shared/hero-header';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getCountryNameByCode } from '@/lib/types/country';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';

type Props = {
	programDetailData: ProgramDetailData;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const ProgramDetail = async ({ programDetailData, lang, region }: Props) => {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-common', 'website-faq', 'website-open-source'],
	});
	// PROTOTYPE: the "people behind this page" panel, mounted on the program page only.
	const programSlug = programDetailData.fullSlug.split('/').filter(Boolean).pop() ?? '';
	const behindTheScenesData = await loadBehindTheScenesData(programSlug, lang);
	const countryIsoCode = programDetailData.programDetails?.countryIsoCode ?? programDetailData.stats?.countryIsoCode;
	const recipientsCount =
		programDetailData.dashboardStats?.recipientsCount ??
		programDetailData.programDetails?.recipientsCount ??
		programDetailData.stats?.recipientsCount ??
		0;
	const completedSurveysCount =
		programDetailData.dashboardStats?.completedSurveysCount ?? programDetailData.programDetails?.completedSurveysCount ?? 0;

	const [breadcrumbLinks, resolvedCountry] = await Promise.all([
		buildBreadcrumbLinks({
			fullSlug: programDetailData.fullSlug,
			currentLabel: programDetailData.title,
			lang,
			region,
		}),
		resolveProgramCountry(countryIsoCode, lang, region),
	]);

	const faqItems = resolveFaqItems(programDetailData.faq ?? []);

	return (
		<BehindTheScenesProvider panel={<BehindTheScenesPanel data={behindTheScenesData} lang={lang} region={region} />}>
			<HeroHeader
				lang={lang}
				showDonationsFormMobile={false}
				campaignId={programDetailData.campaignId}
				title={programDetailData.title}
				heroImage={programDetailData.heroImage}
				stats={
					programDetailData.stats
						? [
								{
									label: getCountryNameByCode(programDetailData.stats.countryIsoCode),
								},
								{
									value: programDetailData.stats.recipientsCount,
									label:
										programDetailData.stats.recipientsCount === 1
											? translator.t('programs-page.recipient-singular')
											: translator.t('programs-page.recipient-plural'),
								},
							]
						: []
				}
			/>
			<div className="flex flex-col gap-8 py-8">
				<BlockWrapper disableMarginTop={true} disableMarginBottom={true}>
					<div className="flex items-center justify-between gap-4">
						<Breadcrumb links={breadcrumbLinks} layout="inline" />
						<BehindTheScenesTeaser
							tickerItems={[
								translator.t('behind-the-scenes.teaser.ticker.open', { namespace: 'website-open-source' }),
								translator.t('behind-the-scenes.teaser.ticker.volunteers', {
									namespace: 'website-open-source',
									context: { count: behindTheScenesData.peopleTotal },
								}),
								translator.t('behind-the-scenes.teaser.ticker.contribute', { namespace: 'website-open-source' }),
								translator.t('behind-the-scenes.teaser.ticker.cta', { namespace: 'website-open-source' }),
							]}
							ariaLabel={translator.t('behind-the-scenes.teaser.aria', { namespace: 'website-open-source' })}
							avatars={buildTeaserAvatars(behindTheScenesData)}
						/>
					</div>
				</BlockWrapper>
				<div className="lg:hidden">
					<BlockWrapper disableMarginTop={true} disableMarginBottom={true}>
						<DonationFormServer lang={lang} campaignId={programDetailData.campaignId} />
					</BlockWrapper>
				</div>
				<BlockWrapper disableMarginTop={true} disableMarginBottom={true}>
					<div className="grid grid-cols-1 gap-7 lg:grid-cols-2">
						<div className="flex flex-col gap-7">
							{programDetailData.dashboardStats && programDetailData.programId ? (
								<ProgramFinances
									stats={programDetailData.dashboardStats}
									programId={programDetailData.programId}
									translator={translator}
									lang={lang}
								/>
							) : null}
							<ProgramAbout
								programDetailData={programDetailData}
								translator={translator}
								lang={lang}
								region={region}
								resolvedCountry={resolvedCountry}
							/>
						</div>
						<div className="flex flex-col gap-7">
							{resolvedCountry ? <ProgramCountry resolvedCountry={resolvedCountry} translator={translator} /> : null}
							<div className="grid flex-1 grid-cols-1 gap-7 sm:grid-cols-2">
								<ProgramRecipients
									count={recipientsCount}
									programId={programDetailData.programId}
									translator={translator}
									lang={lang}
								/>
								<ProgramSurveys
									completedCount={completedSurveysCount}
									translator={translator}
									lang={lang}
									region={region}
									programId={programDetailData.programId}
								/>
							</div>
						</div>
					</div>
				</BlockWrapper>
			</div>
			{(programDetailData.dashboardStats?.paidOutSoFarChf ?? 0) > 0 ? (
				<ProgramPayoutsTotal programDetailData={programDetailData} translator={translator} lang={lang} region={region} />
			) : null}
			<div className="flex flex-col gap-8 py-8">
				<CampaignJournalTeaser lang={lang} region={region} />
				<ProgramDetailRelatedGrid currentProgramFullSlug={programDetailData.fullSlug} lang={lang} region={region} />
				{faqItems.length > 0 && (
					<BlockWrapper disableMarginTop={true} disableMarginBottom={true}>
						<FaqSelectionContent heading={translator.t('title', { namespace: 'website-faq' })} items={faqItems} />
					</BlockWrapper>
				)}
			</div>
		</BehindTheScenesProvider>
	);
};

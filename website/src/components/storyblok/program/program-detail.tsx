import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { buildBreadcrumbLinks } from '@/components/breadcrumb/build-breadcrumb-links';
import { CampaignJournalTeaser } from '@/components/campaign/campaign-journal-teaser';
import { Community } from '@/components/community/community';
import { FaqSelectionContent } from '@/components/content-blocks/faq-selection-content';
import { resolveFaqItems } from '@/components/content-blocks/faq-selection.utils';
import { DonationForm } from '@/components/donation-wizard/donation-form';
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
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getCountryNameByCode } from '@/lib/types/country';
import type { CommunityPanelData } from '@/modules/community/community.types';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { getTranslations } from 'next-intl/server';

type Props = {
	programDetailData: ProgramDetailData;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
	community: CommunityPanelData | null;
};

export const ProgramDetail = async ({ programDetailData, lang, currency, community }: Props) => {
	const countryIsoCode = programDetailData.programDetails?.countryIsoCode ?? programDetailData.stats?.countryIsoCode;
	const recipientsCount =
		programDetailData.dashboardStats?.recipientsCount ??
		programDetailData.programDetails?.recipientsCount ??
		programDetailData.stats?.recipientsCount ??
		0;
	const completedSurveysCount =
		programDetailData.dashboardStats?.completedSurveysCount ?? programDetailData.programDetails?.completedSurveysCount ?? 0;

	const [t, tFaq, breadcrumbLinks, resolvedCountry] = await Promise.all([
		getTranslations('website-common'),
		getTranslations('website-faq'),
		buildBreadcrumbLinks({
			fullSlug: programDetailData.fullSlug,
			currentLabel: programDetailData.title,
			lang,
			currency,
		}),
		resolveProgramCountry(countryIsoCode, lang, currency),
	]);

	const faqItems = resolveFaqItems(programDetailData.faq ?? []);

	return (
		<>
			<HeroHeader
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
											? t('programs-page.recipient-singular')
											: t('programs-page.recipient-plural'),
								},
							]
						: []
				}
			/>
			<div className="flex flex-col gap-8 py-8">
				<Breadcrumb links={breadcrumbLinks} layout="section" aside={community ? <Community data={community} /> : null} />
				<div className="lg:hidden">
					<BlockWrapper disableMarginTop={true} disableMarginBottom={true}>
						<DonationForm campaignId={programDetailData.campaignId} />
					</BlockWrapper>
				</div>
				<BlockWrapper disableMarginTop={true} disableMarginBottom={true}>
					<div className="grid grid-cols-1 gap-7 lg:grid-cols-2">
						<div className="flex flex-col gap-7">
							{programDetailData.dashboardStats && programDetailData.programId ? (
								<ProgramFinances
									stats={programDetailData.dashboardStats}
									programId={programDetailData.programId}
									lang={lang}
									currency={currency}
								/>
							) : null}
							<ProgramAbout
								programDetailData={programDetailData}
								lang={lang}
								currency={currency}
								resolvedCountry={resolvedCountry}
							/>
						</div>
						<div className="flex flex-col gap-7">
							{resolvedCountry ? <ProgramCountry resolvedCountry={resolvedCountry} /> : null}
							<div className="grid flex-1 grid-cols-1 gap-7 sm:grid-cols-2">
								<ProgramRecipients count={recipientsCount} programId={programDetailData.programId} lang={lang} />
								<ProgramSurveys
									completedCount={completedSurveysCount}
									lang={lang}
									currency={currency}
									programId={programDetailData.programId}
								/>
							</div>
						</div>
					</div>
				</BlockWrapper>
			</div>
			{(programDetailData.dashboardStats?.paidOutSoFarChf ?? 0) > 0 ? (
				<ProgramPayoutsTotal programDetailData={programDetailData} lang={lang} currency={currency} />
			) : null}
			<div className="flex flex-col gap-8 py-8">
				<CampaignJournalTeaser lang={lang} currency={currency} />
				<ProgramDetailRelatedGrid currentProgramFullSlug={programDetailData.fullSlug} lang={lang} currency={currency} />
				{faqItems.length > 0 && (
					<BlockWrapper disableMarginTop={true} disableMarginBottom={true}>
						<FaqSelectionContent heading={tFaq('title')} items={faqItems} />
					</BlockWrapper>
				)}
			</div>
		</>
	);
};

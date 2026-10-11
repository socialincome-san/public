import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { buildBreadcrumbLinks } from '@/components/breadcrumb/build-breadcrumb-links';
import { Community } from '@/components/community/community';
import { TestimonialCarouselBlock } from '@/components/content-blocks/testimonial-carousel';
import { isFocusStory } from '@/components/storyblok/focus/focus.utils';
import { EntityAboutSection } from '@/components/storyblok/shared/entity-about-section';
import { HeroHeader } from '@/components/storyblok/shared/hero-header';
import type { TestimonialCarousel } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import type { CommunityPanelData } from '@/modules/community/community.types';
import { getLocalPartnerProgramSummariesAction } from '@/modules/local-partners/local-partner.actions';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { getTranslations } from 'next-intl/server';
import { LocalPartnerAboutMetaCard, LocalPartnerFocusBadges } from './local-partner-about-meta';
import { LocalPartnerPartners } from './local-partner-partners';
import { LocalPartnerPayoutsTotal } from './local-partner-payouts-total';
import { LocalPartnerPrograms } from './local-partner-programs';
import { LocalPartnerProgramsCard } from './local-partner-programs-card';
import type { LocalPartnerStory } from './local-partner.types';
import { getLocalPartnerIsoCode, getLocalPartnerTitle } from './local-partner.utils';

type Props = {
	localPartner: LocalPartnerStory;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
	recipientsCount: number;
	completedSurveysCount: number;
	community: CommunityPanelData | null;
};

export const LocalPartnerDetail = async ({
	localPartner,
	lang,
	currency,
	recipientsCount,
	completedSurveysCount,
	community,
}: Props) => {
	const localPartnerTitle = getLocalPartnerTitle(localPartner.content);
	const isoCode = getLocalPartnerIsoCode(localPartner.content);
	const focuses = (localPartner.content.focuses ?? []).filter(isFocusStory);
	const [t, partnerProgramsResult] = await Promise.all([
		getTranslations('website-common'),
		getLocalPartnerProgramSummariesAction({
			lang,
			localPartnerPortalSlug: localPartner.content.portalSlug?.trim() ?? '',
			countryIsoCode: isoCode ?? '',
		}),
	]);
	const partnerPrograms = partnerProgramsResult.success
		? partnerProgramsResult.data
		: { programs: [], programCount: 0, recipientsTotal: 0, isPartnerScoped: false };
	const heroCard = <LocalPartnerProgramsCard partnerPrograms={partnerPrograms} lang={lang} currency={currency} />;
	const breadcrumbLinks = await buildBreadcrumbLinks({
		fullSlug: localPartner.full_slug,
		currentLabel: localPartnerTitle,
		lang,
		currency,
	});

	const { mission, partnerSince, foundingYear, location, website, linkedin, instagram, facebook, youtube } =
		localPartner.content;

	return (
		<>
			<HeroHeader
				title={localPartnerTitle}
				heroImage={localPartner.content.heroImage}
				titleIcon={isoCode ? `/assets/flags/${isoCode.toLowerCase()}.svg` : undefined}
				titleIconAlt={isoCode ? `${isoCode} flag` : undefined}
				showDonationsFormMobile={false}
				heroCard={heroCard}
				stats={[
					{
						value: recipientsCount,
						label:
							recipientsCount === 1
								? t('local-partners-page.recipient-singular')
								: t('local-partners-page.recipient-plural'),
					},
					{
						value: completedSurveysCount,
						label:
							completedSurveysCount === 1
								? t('local-partners-page.completed-survey-singular')
								: t('local-partners-page.completed-survey-plural'),
					},
				]}
			/>
			<Breadcrumb links={breadcrumbLinks} aside={community ? <Community data={community} /> : null} />
			<div className="lg:hidden">
				<BlockWrapper disableMarginTop={true} disableMarginBottom={true}>
					{heroCard}
				</BlockWrapper>
			</div>
			<EntityAboutSection
				isoCode={isoCode}
				mapLabel={localPartnerTitle}
				aboutHeading={`${t('local-partners-page.about')} ${localPartnerTitle}`}
				description={localPartner.content.description}
				preDescription={<LocalPartnerFocusBadges lang={lang} currency={currency} focuses={focuses} />}
				postDescription={
					<LocalPartnerAboutMetaCard
						lang={lang}
						currency={currency}
						mission={mission}
						partnerSince={partnerSince}
						foundingYear={foundingYear}
						location={location}
						externalLinks={[
							{ label: 'Website', link: website },
							{ label: 'LinkedIn', link: linkedin },
							{ label: 'Instagram', link: instagram },
							{ label: 'Facebook', link: facebook },
							{ label: 'YouTube', link: youtube },
						]}
					/>
				}
			/>
			<LocalPartnerPayoutsTotal localPartner={localPartner} lang={lang} currency={currency} />
			{Array.isArray(localPartner.content.testimonial)
				? localPartner.content.testimonial.map((blok: TestimonialCarousel) => (
						<TestimonialCarouselBlock key={blok._uid} blok={blok} />
					))
				: null}
			<LocalPartnerPrograms localPartner={localPartner} lang={lang} currency={currency} />
			<LocalPartnerPartners localPartner={localPartner} lang={lang} currency={currency} />
		</>
	);
};

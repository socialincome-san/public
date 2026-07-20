import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { buildBreadcrumbLinks } from '@/components/breadcrumb/build-breadcrumb-links';
import { TestimonialCarouselBlock } from '@/components/content-blocks/testimonial-carousel';
import { isFocusStory } from '@/components/storyblok/focus/focus.utils';
import { EntityAboutSection } from '@/components/storyblok/shared/entity-about-section';
import { HeroHeader } from '@/components/storyblok/shared/hero-header';
import type { TestimonialCarousel } from '@/generated/storyblok/types/109655/storyblok-components';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { LocalPartnerAboutMetaCard, LocalPartnerFocusBadges } from './local-partner-about-meta';
import { LocalPartnerPartners } from './local-partner-partners';
import { LocalPartnerPayoutsTotal } from './local-partner-payouts-total';
import { LocalPartnerPrograms } from './local-partner-programs';
import type { LocalPartnerStory } from './local-partner.types';
import { getLocalPartnerIsoCode, getLocalPartnerTitle } from './local-partner.utils';

type Props = {
	localPartner: LocalPartnerStory;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	recipientsCount: number;
	completedSurveysCount: number;
};

export const LocalPartnerDetail = async ({ localPartner, lang, region, recipientsCount, completedSurveysCount }: Props) => {
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });
	const localPartnerTitle = getLocalPartnerTitle(localPartner.content);
	const isoCode = getLocalPartnerIsoCode(localPartner.content);
	const focuses = (localPartner.content.focuses ?? []).filter(isFocusStory);
	const breadcrumbLinks = await buildBreadcrumbLinks({
		fullSlug: localPartner.full_slug,
		currentLabel: localPartnerTitle,
		lang,
		region,
	});

	const { mission, partnerSince, foundingYear, location, website, linkedin, instagram, facebook, youtube } =
		localPartner.content;

	return (
		<>
			<HeroHeader
				lang={lang}
				title={localPartnerTitle}
				heroImage={localPartner.content.heroImage}
				titleIcon={isoCode ? `/assets/flags/${isoCode.toLowerCase()}.svg` : undefined}
				titleIconAlt={isoCode ? `${isoCode} flag` : undefined}
				showDonationForm={false}
				showDonationsFormMobile={false}
				stats={[
					{
						value: recipientsCount,
						label:
							recipientsCount === 1
								? translator.t('local-partners-page.recipient-singular')
								: translator.t('local-partners-page.recipient-plural'),
					},
					{
						value: completedSurveysCount,
						label:
							completedSurveysCount === 1
								? translator.t('local-partners-page.completed-survey-singular')
								: translator.t('local-partners-page.completed-survey-plural'),
					},
				]}
			/>
				<Breadcrumb links={breadcrumbLinks} />
				<EntityAboutSection
					isoCode={isoCode}
					mapLabel={localPartnerTitle}
					aboutHeading={`${translator.t('local-partners-page.about')} ${localPartnerTitle}`}
					description={localPartner.content.description}
					preDescription={<LocalPartnerFocusBadges lang={lang} region={region} focuses={focuses} />}
					postDescription={
						<LocalPartnerAboutMetaCard
							lang={lang}
							region={region}
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
				<LocalPartnerPayoutsTotal localPartner={localPartner} lang={lang} region={region} />
				{Array.isArray(localPartner.content.testimonial)
					? localPartner.content.testimonial.map((blok: TestimonialCarousel) => (
							<TestimonialCarouselBlock key={blok._uid} blok={blok} />
						))
					: null}
				<LocalPartnerPrograms localPartner={localPartner} lang={lang} region={region} />
				<LocalPartnerPartners localPartner={localPartner} lang={lang} region={region} />
		</>
	);
};

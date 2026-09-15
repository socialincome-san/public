import { BlockWrapper } from '@/components/block-wrapper';
import { Carousel, CarouselContent, CarouselItem, CarouselScrollNextButton } from '@/components/carousel';
import { LocalPartnerTeaserCard } from '@/components/storyblok/local-partner/local-partner-teaser-card';
import type { LocalPartnerStory } from '@/components/storyblok/local-partner/local-partner.types';
import { getLocalPartnerPortalSlug } from '@/components/storyblok/local-partner/local-partner.utils';
import { LocalPartnersTeaserIntro } from '@/components/storyblok/local-partner/local-partners-teaser-intro';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getLocalPartnerOverviewStats } from '@/lib/storyblok/local-partner-overview-stats';

type ContentProps = {
	localPartners: LocalPartnerStory[];
	title?: string;
	text?: string;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const LocalPartnersTeaserRowContent = async ({ localPartners, lang, region }: ContentProps) => {
	if (localPartners.length === 0) {
		return null;
	}

	const portalSlugs = localPartners.map((localPartner) => getLocalPartnerPortalSlug(localPartner.content)).filter(Boolean);
	const [translator, statsByPortalSlug] = await Promise.all([
		Translator.getInstance({ language: lang, namespaces: ['website-common'] }),
		getLocalPartnerOverviewStats(portalSlugs),
	]);
	const viewDetailsLabel = translator.t('local-partners-page.view-details');
	const createProgramLabel = translator.t('local-partners-page.create-program');
	const nextButtonAriaLabel = translator.t('local-partners-page.teaser-next-button-aria');

	return (
		<BlockWrapper className="max-2xl:overflow-visible">
			<div className="grid gap-8 max-2xl:w-[calc(100%+max(0px,calc((100vw-100%)/2)))] lg:grid-cols-3 lg:items-center">
				<div className="pr-8 lg:col-span-1 lg:pr-0">
					<LocalPartnersTeaserIntro lang={lang} />
				</div>
				<div className="relative min-w-0 lg:col-span-2">
					<Carousel opts={{ align: 'start' }}>
						<CarouselContent className="-ml-6">
							{localPartners.map((localPartner) => {
								const portalSlug = getLocalPartnerPortalSlug(localPartner.content);
								const recipientsCount = statsByPortalSlug[portalSlug]?.recipientsCount ?? 0;
								const candidatesCount = statsByPortalSlug[portalSlug]?.candidatesCount ?? 0;
								const recipientsLabel = translator.t(
									recipientsCount === 1 ? 'local-partners-page.recipient-singular' : 'local-partners-page.recipient-plural',
								);
								const candidatesLabel = translator.t(
									candidatesCount === 1
										? 'local-partners-page.candidates-ready-to-enroll_one'
										: 'local-partners-page.candidates-ready-to-enroll_other',
									{ context: { displayCount: candidatesCount === 0 ? '00' : candidatesCount } },
								);

								return (
									<CarouselItem key={localPartner.uuid} className="basis-[305px] pl-6">
										<LocalPartnerTeaserCard
											localPartner={localPartner}
											lang={lang}
											region={region}
											viewDetailsLabel={viewDetailsLabel}
											recipientsCount={recipientsCount}
											recipientsLabel={recipientsLabel}
											candidatesLabel={candidatesLabel}
											createProgramLabel={createProgramLabel}
										/>
									</CarouselItem>
								);
							})}
						</CarouselContent>
						<CarouselScrollNextButton aria-label={nextButtonAriaLabel} />
					</Carousel>
				</div>
			</div>
		</BlockWrapper>
	);
};

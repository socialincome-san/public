import {
	getLocalPartnerCandidateFooter,
	LocalPartnerTeaserCard,
} from '@/components/storyblok/local-partner/local-partner-teaser-card';
import type { LocalPartnerStory } from '@/components/storyblok/local-partner/local-partner.types';
import { getLocalPartnerPortalSlug } from '@/components/storyblok/local-partner/local-partner.utils';
import { LocalPartnersTeaserIntro } from '@/components/storyblok/local-partner/local-partners-teaser-intro';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getLocalPartnerOverviewStatsAction } from '@/modules/local-partners/local-partner.actions';
import { Carousel, CarouselContent, CarouselItem } from '@socialincome/design-system/data-display/carousel/carousel';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { getTranslations } from 'next-intl/server';

type ContentProps = {
	localPartners: LocalPartnerStory[];
	title?: string;
	text?: string;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
};

export const LocalPartnersTeaserRowContent = async ({ localPartners, lang, currency }: ContentProps) => {
	if (localPartners.length === 0) {
		return null;
	}

	const portalSlugs = localPartners.map((localPartner) => getLocalPartnerPortalSlug(localPartner.content)).filter(Boolean);
	const [t, statsResult] = await Promise.all([
		getTranslations('website-common'),
		getLocalPartnerOverviewStatsAction(portalSlugs),
	]);
	const statsByPortalSlug = statsResult.success ? statsResult.data : {};

	return (
		<BlockWrapper>
			<div className="grid gap-8 max-2xl:w-[calc(100%+max(0px,calc((100vw-100%)/2)))] lg:grid-cols-3 lg:items-center">
				<div className="pr-8 lg:col-span-1 lg:pr-0">
					<LocalPartnersTeaserIntro />
				</div>
				<div className="relative min-w-0 lg:col-span-2">
					<Carousel opts={{ align: 'start' }} gap="lg">
						<CarouselContent scrollFade>
							{localPartners.map((localPartner) => {
								const portalSlug = getLocalPartnerPortalSlug(localPartner.content);
								const recipientsCount = statsByPortalSlug[portalSlug]?.recipientsCount ?? 0;
								const candidatesCount = statsByPortalSlug[portalSlug]?.candidatesCount ?? 0;
								const recipientsLabel = t(
									recipientsCount === 1 ? 'local-partners-page.recipient-singular' : 'local-partners-page.recipient-plural',
								);
								const { candidatesLabel, alertVariant } = getLocalPartnerCandidateFooter(t, candidatesCount);

								return (
									<CarouselItem key={localPartner.uuid} size="card">
										<LocalPartnerTeaserCard
											localPartner={localPartner}
											lang={lang}
											currency={currency}
											recipientsCount={recipientsCount}
											recipientsLabel={recipientsLabel}
											candidatesLabel={candidatesLabel}
											alertVariant={alertVariant}
										/>
									</CarouselItem>
								);
							})}
						</CarouselContent>
					</Carousel>
				</div>
			</div>
		</BlockWrapper>
	);
};

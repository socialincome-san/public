import { Carousel, CarouselContent, CarouselItem, CarouselScrollNextButton } from '@/components/carousel';
import { LocalPartnerTeaserCard } from '@/components/storyblok/local-partner/local-partner-teaser-card';
import type { LocalPartnerStory } from '@/components/storyblok/local-partner/local-partner.types';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';

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

	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });
	const viewDetailsLabel = translator.t('local-partners-page.view-details');
	const localPartnersTitle = translator.t('local-partners-page.teaser-title');
	const localPartnersSubtitle = translator.t('local-partners-page.teaser-subtitle');
	const localPartnersText = translator.t('local-partners-page.teaser-text');
	const nextButtonAriaLabel = translator.t('local-partners-page.teaser-next-button-aria');

	return (
		<div className="grid gap-8 lg:grid-cols-3 lg:items-center">
			<div className="space-y-8 lg:col-span-1 pr-8 lg:pr-0">
				<p className="text-foreground mb-0 text-4xl break-words">{localPartnersTitle}</p>
				<p className="text-foreground text-4xl font-bold break-words">{localPartnersSubtitle}</p>
				<p className="text-muted-foreground text-base leading-7">{localPartnersText}</p>
			</div>
			<div className="relative min-w-0 lg:col-span-2">
				<Carousel opts={{ align: 'start' }}>
					<CarouselContent className="-ml-6">
						{localPartners.map((localPartner) => (
							<CarouselItem key={localPartner.uuid} className="basis-[305px] pl-6">
								<LocalPartnerTeaserCard
									localPartner={localPartner}
									lang={lang}
									region={region}
									viewDetailsLabel={viewDetailsLabel}
								/>
							</CarouselItem>
						))}
					</CarouselContent>
					<CarouselScrollNextButton aria-label={nextButtonAriaLabel} />
				</Carousel>
			</div>
		</div>
	);
};

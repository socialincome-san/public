import { BlockWrapper } from '@/components/block-wrapper';
import { Carousel, CarouselContent, CarouselItem, CarouselScrollNextButton } from '@/components/carousel';
import { LocalPartnerTeaserCard } from '@/components/storyblok/local-partner/local-partner-teaser-card';
import type { LocalPartnerStory } from '@/components/storyblok/local-partner/local-partner.types';
import { LocalPartnersTeaserIntro } from '@/components/storyblok/local-partner/local-partners-teaser-intro';
import { Translator } from '@/lib/i18n/translator';
import { getWebsiteRootParams } from '@/lib/i18n/website-root-params';

type ContentProps = {
	localPartners: LocalPartnerStory[];
	title?: string;
	text?: string;
};

export const LocalPartnersTeaserRowContent = async ({ localPartners }: ContentProps) => {
	const { lang } = await getWebsiteRootParams();
	if (localPartners.length === 0) {
		return null;
	}

	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });
	const viewDetailsLabel = translator.t('local-partners-page.view-details');
	const nextButtonAriaLabel = translator.t('local-partners-page.teaser-next-button-aria');

	return (
		<BlockWrapper className="max-2xl:overflow-visible">
			<div className="grid gap-8 max-2xl:w-[calc(100%+max(0px,calc((100vw-100%)/2)))] lg:grid-cols-3 lg:items-center">
				<div className="pr-8 lg:col-span-1 lg:pr-0">
					<LocalPartnersTeaserIntro />
				</div>
				<div className="relative min-w-0 lg:col-span-2">
					<Carousel opts={{ align: 'start' }}>
						<CarouselContent className="-ml-6">
							{localPartners.map((localPartner) => (
								<CarouselItem key={localPartner.uuid} className="basis-[305px] pl-6">
									<LocalPartnerTeaserCard localPartner={localPartner} viewDetailsLabel={viewDetailsLabel} />
								</CarouselItem>
							))}
						</CarouselContent>
						<CarouselScrollNextButton aria-label={nextButtonAriaLabel} />
					</Carousel>
				</div>
			</div>
		</BlockWrapper>
	);
};

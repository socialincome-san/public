import { DonationsTotalBlockServer } from '@/components/content-blocks/donations-total-server';
import { DownloadsBlock } from '@/components/content-blocks/downloads';
import { ExplainerVideoHeaderBlock } from '@/components/content-blocks/explainer-video-header';
import { FaqSelectionBlock } from '@/components/content-blocks/faq-selection';
import { HeroVideoBlockServer } from '@/components/content-blocks/hero-video-server';
import { ImageTextBlock } from '@/components/content-blocks/image-text';
import { ImpactMeasurementBlock } from '@/components/content-blocks/impact-measurement';
import { JournalTeasersBlock } from '@/components/content-blocks/journal-teasers';
import { ModalCardsBlock } from '@/components/content-blocks/modal-cards';
import { OpenSourceBlock } from '@/components/content-blocks/open-source';
import { PartnershipsCarouselBlock } from '@/components/content-blocks/partnerships-carousel';
import { ProgramGridBlock } from '@/components/content-blocks/program-grid';
import { SpacerBlock } from '@/components/content-blocks/spacer';
import { TeamGridBlock } from '@/components/content-blocks/team-grid';
import { TestimonialCarouselBlock } from '@/components/content-blocks/testimonial-carousel';
import { TestimonialBlock } from '@/components/content-blocks/testimonial-entry';
import { TextBlock } from '@/components/content-blocks/text';
import { TransparencyBlock } from '@/components/content-blocks/transparency';
import { TwoColumnTextBlock } from '@/components/content-blocks/two-column-text';
import { VideoTextBlock } from '@/components/content-blocks/video-text';
import type { Page } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import type { ParsedUrlQueryInput } from 'querystring';
import { Fragment } from 'react';

type PageBlock = Page['content'][number];

type PageContentTypeProps = {
	blok: Page;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	searchParams?: ParsedUrlQueryInput;
};

const renderPageBlock = (
	block: PageBlock,
	lang: WebsiteLanguage,
	region: WebsiteRegion,
	searchParams?: ParsedUrlQueryInput,
) => {
	switch (block.component) {
		case 'donationsTotal':
			return <DonationsTotalBlockServer blok={block} lang={lang} region={region} />;
		case 'downloads':
			return <DownloadsBlock blok={block} />;
		case 'explainerVideoHeader':
			return <ExplainerVideoHeaderBlock blok={block} lang={lang} region={region} />;
		case 'faqSelection':
			return <FaqSelectionBlock blok={block} lang={lang} region={region} />;
		case 'heroVideo':
			return <HeroVideoBlockServer blok={block} lang={lang} region={region} />;
		case 'imageText':
			return <ImageTextBlock blok={block} />;
		case 'impactMeasurement':
			return <ImpactMeasurementBlock blok={block} lang={lang} searchParams={searchParams} />;
		case 'journalTeasers':
			return <JournalTeasersBlock blok={block} lang={lang} region={region} />;
		case 'modalCards':
			return <ModalCardsBlock blok={block} />;
		case 'openSource':
			return <OpenSourceBlock blok={block} lang={lang} />;
		case 'partnershipsCarousel':
			return <PartnershipsCarouselBlock blok={block} />;
		case 'programGrid':
			return <ProgramGridBlock blok={block} lang={lang} region={region} />;
		case 'spacer':
			return <SpacerBlock blok={block} />;
		case 'teamGrid':
			return <TeamGridBlock blok={block} lang={lang} />;
		case 'testimonial':
			return <TestimonialBlock blok={block} />;
		case 'testimonialCarousel':
			return <TestimonialCarouselBlock blok={block} />;
		case 'text':
			return <TextBlock blok={block} />;
		case 'transparency':
			return <TransparencyBlock blok={block} lang={lang} />;
		case 'twoColumnText':
			return <TwoColumnTextBlock blok={block} />;
		case 'videoText':
			return <VideoTextBlock blok={block} />;
		default:
			block satisfies never;

			return null;
	}
};

export default function PageContentType({ blok, lang, region, searchParams }: PageContentTypeProps) {
	return (
		blok.content?.map((currentBlock) => (
			<Fragment key={currentBlock._uid}>{renderPageBlock(currentBlock, lang, region, searchParams)}</Fragment>
		)) ?? null
	);
}

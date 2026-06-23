'use client';

import { BlockWrapper } from '@/components/block-wrapper';
import { Dialog, DialogContent, DialogTitle } from '@/components/dialog';
import { ExplainerVideoTrigger } from '@/components/explainer-video/explainer-video-trigger';
import { SectionHeading } from '@/components/section-heading';
import { StoryblokMarkdown } from '@/components/storyblok-markdown';
import { RichTextRenderer } from '@/components/storyblok/rich-text-renderer';
import { ModalCards } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { resolveStoryblokLink } from '@/lib/services/storyblok/storyblok.utils';
import { VimeoVideoMatchAndExtract } from '@/lib/utils/UrlVideoParser';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';
import { PlusIcon } from 'lucide-react';
import NextImage from 'next/image';
import { useState } from 'react';

type Props = {
	blok: ModalCards;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

const vimeoMatcher = new VimeoVideoMatchAndExtract();

export const ModalCardsBlock = ({ blok, lang, region }: Props) => {
	const { heading, cards, explainerVideoThumbnail, labelForExplainerVideo, linkToExplainerVideo } = blok;
	const [openCardId, setOpenCardId] = useState<string | null>(null);
	const explainerVideoLabel = labelForExplainerVideo?.trim();
	const resolvedExplainerVideoUrl = linkToExplainerVideo ? resolveStoryblokLink(linkToExplainerVideo, lang, region) : null;
	const explainerVideoEmbedUrl = resolvedExplainerVideoUrl ? vimeoMatcher.parseUrl(resolvedExplainerVideoUrl) : null;
	const hasExplainerVideo = Boolean(explainerVideoLabel && explainerVideoEmbedUrl);
	const explainerVideoThumbnailSrc = explainerVideoThumbnail?.filename;

	return (
		<BlockWrapper {...storyblokEditable(blok as SbBlokData)}>
			<div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row lg:mb-14">
				{heading && (
					<SectionHeading as="h1" align="left" size="large" className="mb-0 md:mb-0">
						<StoryblokMarkdown>{heading}</StoryblokMarkdown>
					</SectionHeading>
				)}
				{hasExplainerVideo && (
					<ExplainerVideoTrigger
						layout="stacked"
						label={explainerVideoLabel!}
						embedUrl={explainerVideoEmbedUrl!}
						thumbnailSrc={explainerVideoThumbnailSrc ?? undefined}
						thumbnailAlt={explainerVideoThumbnail?.alt ?? undefined}
						dialogTitle={explainerVideoLabel}
						className="self-center"
					/>
				)}
			</div>

			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{cards?.map(({ image, heading, modalContent, _uid }) => {
					if (!image.filename) {
						return null;
					}

					return (
						<Dialog key={_uid} open={openCardId === _uid} onOpenChange={(isOpen) => setOpenCardId(isOpen ? _uid : null)}>
							<button
								type="button"
								onClick={() => setOpenCardId(_uid)}
								className="group relative aspect-4/3 w-full overflow-hidden rounded-3xl text-left md:aspect-3/4"
							>
								<NextImage
									src={image.filename}
									alt={image.alt ?? heading}
									fill
									sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
									className="scale-105 object-cover transition-transform duration-300 ease-out group-hover:scale-100"
								/>
								<div className="from-foreground/65 via-foreground/10 absolute inset-0 bg-linear-to-t to-transparent" />
								<div className="text-primary bg-primary-foreground absolute top-5 right-5 flex size-11 items-center justify-center rounded-full shadow-sm transition-transform duration-300 ease-out group-hover:scale-110 md:top-10 md:right-10">
									<PlusIcon className="size-6" />
								</div>
								<span className="text-primary-foreground absolute right-5 bottom-5 left-5 text-3xl leading-tight md:right-10 md:bottom-10 md:left-10 md:text-4xl">
									{heading}
								</span>
							</button>
							<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
								<DialogTitle>{heading}</DialogTitle>
								{modalContent && (
									<div className="text-foreground text-base">
										<RichTextRenderer richTextDocument={modalContent} />
									</div>
								)}
							</DialogContent>
						</Dialog>
					);
				})}
			</div>
		</BlockWrapper>
	);
};

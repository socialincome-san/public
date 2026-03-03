'use client';

import { BlockWrapper } from '@/components/block-wrapper';
import { Dialog, DialogContent, DialogTitle } from '@/components/dialog';
import { RichTextRenderer } from '@/components/storyblok/rich-text-renderer';
import { ModalCards } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { resolveStoryblokLink } from '@/lib/services/storyblok/storyblok.utils';
import { VimeoVideoMatchAndExtract } from '@/lib/utils/UrlVideoParser';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';
import { PlayIcon, PlusIcon } from 'lucide-react';
import NextImage from 'next/image';
import { useState } from 'react';
import Markdown from 'react-markdown';
import type { StoryblokRichtext } from 'storyblok-rich-text-react-renderer';

type Props = {
	blok: ModalCards;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

const vimeoMatcher = new VimeoVideoMatchAndExtract();

export const ModalCardsBlock = ({ blok, lang, region }: Props) => {
	const { heading, cards, explainerVideoThumbnail, labelForExplainerVideo, linkToExplainerVideo } = blok;
	const [openCardId, setOpenCardId] = useState<string | null>(null);
	const [isExplainerVideoOpen, setIsExplainerVideoOpen] = useState(false);
	const explainerVideoLabel = labelForExplainerVideo?.trim();
	const resolvedExplainerVideoUrl = linkToExplainerVideo
		? resolveStoryblokLink(linkToExplainerVideo, lang, region)
		: null;
	const explainerVideoEmbedUrl = resolvedExplainerVideoUrl ? vimeoMatcher.parseUrl(resolvedExplainerVideoUrl) : null;
	const hasExplainerVideo = Boolean(explainerVideoLabel && explainerVideoEmbedUrl);
	const explainerVideoThumbnailSrc = explainerVideoThumbnail?.filename;
	const explainerVideoAccessibleLabel = explainerVideoLabel ?? 'Explainer video';

	return (
		<BlockWrapper {...storyblokEditable(blok as SbBlokData)}>
			<div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row lg:mb-14">
				{heading && (
					<h1 className="text-3xl leading-[1.2] whitespace-pre-line md:text-4xl xl:text-5xl [&_strong]:font-bold">
						<Markdown components={{ p: ({ children }) => <>{children}</> }}>{heading}</Markdown>
					</h1>
				)}
				{hasExplainerVideo &&
					(explainerVideoThumbnailSrc ? (
						<button
							type="button"
							onClick={() => setIsExplainerVideoOpen(true)}
							className="group flex flex-col items-center gap-4 self-center text-sm"
						>
							<span className="relative aspect-video h-16 overflow-hidden rounded-full shadow-md">
								<NextImage
									src={explainerVideoThumbnailSrc}
									alt={explainerVideoThumbnail?.alt ?? explainerVideoAccessibleLabel}
									fill
									sizes="176px"
									className="object-cover"
								/>
								<span className="absolute inset-0 bg-black/10" />
								<span className="absolute top-1/2 left-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 transition-transform duration-200 ease-out group-hover:scale-105">
									<PlayIcon className="size-6 text-white" />
								</span>
							</span>
							<span className="group-hover:underline">{explainerVideoLabel}</span>
						</button>
					) : (
						<button
							type="button"
							onClick={() => setIsExplainerVideoOpen(true)}
							className="inline-flex items-center gap-2 self-center text-sm hover:underline"
						>
							<PlayIcon className="size-6" />
							{explainerVideoLabel}
						</button>
					))}
			</div>

			{hasExplainerVideo && (
				<Dialog open={isExplainerVideoOpen} onOpenChange={setIsExplainerVideoOpen}>
					<DialogContent className="sm:max-w-content overflow-hidden rounded-3xl border-none p-0">
						<DialogTitle className="sr-only">{explainerVideoLabel}</DialogTitle>
						<iframe
							src={explainerVideoEmbedUrl!}
							title={explainerVideoLabel}
							sandbox="allow-scripts allow-same-origin allow-presentation"
							allow="fullscreen; autoplay"
							loading="lazy"
							className="aspect-video w-full border-0"
						/>
					</DialogContent>
				</Dialog>
			)}

			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{cards?.map(({ image, heading, modalContent, _uid }) => {
					if (!image.filename) {
						return null;
					}

					return (
						<Dialog
							key={_uid}
							open={openCardId === _uid}
							onOpenChange={(isOpen) => setOpenCardId(isOpen ? _uid : null)}
						>
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
								<div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/10 to-transparent" />
								<div className="text-primary absolute top-5 right-5 flex size-11 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-300 ease-out group-hover:scale-110 md:top-10 md:right-10">
									<PlusIcon className="size-6" />
								</div>
								<h3 className="absolute right-5 bottom-5 left-5 text-3xl leading-tight text-white md:right-10 md:bottom-10 md:left-10 md:text-4xl">
									{heading}
								</h3>
							</button>
							<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
								<DialogTitle>{heading}</DialogTitle>
								{modalContent && (
									<div className="text-base text-black">
										<RichTextRenderer richTextDocument={modalContent as StoryblokRichtext} />
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

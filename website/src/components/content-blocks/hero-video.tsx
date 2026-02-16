'use client';

import { Button } from '@/components/button';
import { MakeDonationForm } from '@/components/make-donation-form';
import { HeroVideo } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { resolveStoryblokLink } from '@/lib/services/storyblok/storyblok.utils';
import MuxVideo from '@mux/mux-video-react';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';
import NextLink from 'next/link';
import Markdown from 'react-markdown';

type Props = {
	blok: HeroVideo;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export default function HeroVideoBlock({ blok, lang, region }: Props) {
	const { heading, description, muxPlaybackId, button } = blok;

	const showCaptions = false;

	return (
		<div
			{...storyblokEditable(blok as SbBlokData)}
			className="storyblok__outline hero-video-block relative aspect-[16/9] max-h-[80vh] w-full overflow-hidden rounded-b-[56px]"
		>
			<MuxVideo
				className="z-10 h-full w-full object-cover"
				playbackId={muxPlaybackId}
				poster={`https://image.mux.com/${muxPlaybackId}/thumbnail.jpg?time=2`}
				preload="metadata"
				loop
				muted
				autoPlay
				playsInline
			>
				{/* <track kind="captions" src={blok.subtitles} srcLang={blok.lang} label={blok.lang.toUpperCase()} default /> */}
				<style>{`
          video::cue {
            background-color: rgba(0, 0, 0, 0.8);
            color: white;
            font-family: Arial, sans-serif;
            font-size: 24px;
            opacity: ${showCaptions ? 1 : 0};
          }
        `}</style>
			</MuxVideo>
			<div className="container absolute inset-x-0 bottom-[20%] z-20 flex flex-row items-center justify-between gap-4 text-white">
				<div className="flex max-w-2xl flex-col gap-6">
					{heading && (
						<h1 className="text-6xl font-light [&_strong]:font-bold">
							<Markdown>{heading}</Markdown>
						</h1>
					)}
					{description && <p className="text-xl">{description}</p>}
					{button && (
						<div>
							{button.map(({ label, link }) => {
								const href = resolveStoryblokLink(link, lang, region);
								return (
									<Button key={href} variant="outline" size="lg" asChild>
										<NextLink href={href}>{label}</NextLink>
									</Button>
								);
							})}
						</div>
					)}
				</div>
				<MakeDonationForm />
			</div>
		</div>
	);
}

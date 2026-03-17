'use client';

import { Button } from '@/components/button';
import { MakeDonationForm } from '@/components/make-donation-form';
import { VideoControlButton } from '@/components/video-control-button';
import { HeroVideo } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { resolveStoryblokLink } from '@/lib/services/storyblok/storyblok.utils';
import { cn } from '@/lib/utils/cn';
import { ArrowsPointingInIcon, ArrowsPointingOutIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';
import { PauseIcon, PlayIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid';
import MuxVideo from '@mux/mux-video-react';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';
import NextLink from 'next/link';
import { useRef, useState } from 'react';
import Markdown from 'react-markdown';

type Props = {
	blok: HeroVideo;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	subtitleUrl?: string;
	translations: HeroVideoControlTranslations;
};

export type HeroVideoControlTranslations = {
	playVideo: string;
	pauseVideo: string;
	muteVideo: string;
	unmuteVideo: string;
	showCaptions: string;
	hideCaptions: string;
	expandVideoView: string;
	exitExpandedVideoView: string;
};

export const HeroVideoBlock = ({ blok, lang, region, subtitleUrl, translations }: Props) => {
	const { heading, description, muxPlaybackId, button } = blok;
	const videoRef = useRef<HTMLVideoElement>(null);
	const [isExpanded, setIsExpanded] = useState(false);
	const [isPlaying, setIsPlaying] = useState(true);
	const [isMuted, setIsMuted] = useState(true);
	const [showCaptions, setShowCaptions] = useState(true);

	const toggleExpanded = () => {
		const nextExpanded = !isExpanded;
		setIsExpanded(nextExpanded);
		setIsPlaying(true);
		setIsMuted(!nextExpanded);
		void videoRef.current?.play().catch(() => undefined);
	};

	const togglePlayback = () => {
		const video = videoRef.current;
		if (!video) {
			return;
		}

		if (video.paused) {
			void video.play().catch(() => undefined);
			setIsPlaying(true);

			return;
		}

		video.pause();
		setIsPlaying(false);
	};

	return (
		<div {...storyblokEditable(blok as SbBlokData)} className="storyblok__outline hero-video-block flex flex-col gap-6">
			<div
				className={cn(
					'relative aspect-video max-h-[80vh] min-h-112 w-full overflow-hidden bg-black transition-[border-radius] duration-300 ease-out md:min-h-160',
					isExpanded ? 'z-60' : 'rounded-b-3xl md:rounded-b-[56px]',
				)}
			>
				<MuxVideo
					ref={videoRef}
					className={cn('z-10 size-full', isExpanded ? 'object-contain' : 'object-cover')}
					playbackId={muxPlaybackId}
					poster={`https://image.mux.com/${muxPlaybackId}/thumbnail.jpg?time=2`}
					preload="metadata"
					loop
					muted={isMuted}
					autoPlay
					playsInline
					onPlay={() => setIsPlaying(true)}
					onPause={() => setIsPlaying(false)}
				>
					{subtitleUrl && <track kind="captions" src={subtitleUrl} srcLang={lang} label={lang.toUpperCase()} default />}
					<style>{`
            video::cue {
              background-color: rgba(0, 0, 0, 0.8);
              color: white;
              font-size: 24px;
              opacity: ${isExpanded && showCaptions ? 1 : 0};
            }
          `}</style>
				</MuxVideo>

				{isExpanded ? (
					<div className="absolute inset-x-8 bottom-8 z-30 flex items-center justify-between">
						<div className="flex items-center gap-2">
							<VideoControlButton
								onClick={togglePlayback}
								aria-label={isPlaying ? translations.pauseVideo : translations.playVideo}
								title={isPlaying ? translations.pauseVideo : translations.playVideo}
							>
								{isPlaying ? <PauseIcon className="size-5" /> : <PlayIcon className="size-5" />}
							</VideoControlButton>
							<VideoControlButton
								onClick={() => setIsMuted((prev) => !prev)}
								aria-label={isMuted ? translations.unmuteVideo : translations.muteVideo}
								title={isMuted ? translations.unmuteVideo : translations.muteVideo}
							>
								{isMuted ? <SpeakerXMarkIcon className="size-5" /> : <SpeakerWaveIcon className="size-5" />}
							</VideoControlButton>
							{subtitleUrl && (
								<VideoControlButton
									onClick={() => setShowCaptions((prev) => !prev)}
									aria-label={showCaptions ? translations.hideCaptions : translations.showCaptions}
									title={showCaptions ? translations.hideCaptions : translations.showCaptions}
								>
									<ChatBubbleBottomCenterTextIcon className="size-5" />
								</VideoControlButton>
							)}
						</div>
						<VideoControlButton
							onClick={toggleExpanded}
							aria-label={translations.exitExpandedVideoView}
							title={translations.exitExpandedVideoView}
						>
							<ArrowsPointingInIcon className="size-5" />
						</VideoControlButton>
					</div>
				) : (
					<VideoControlButton
						className="absolute right-8 bottom-8 z-30"
						onClick={toggleExpanded}
						aria-label={translations.expandVideoView}
						title={translations.expandVideoView}
					>
						<ArrowsPointingOutIcon className="size-5" />
					</VideoControlButton>
				)}

				{!isExpanded && (
					<div className="w-site-width max-w-content absolute inset-0 z-20 mx-auto flex flex-row items-center justify-between gap-4 text-white">
						<div className="flex max-w-2xl flex-col gap-6">
							{heading && (
								<h1 className="text-4xl font-light xl:text-6xl [&_strong]:font-bold">
									<Markdown components={{ p: ({ children }) => <>{children}</> }}>{heading}</Markdown>
								</h1>
							)}
							{description && <p className="text-xl">{description}</p>}
							{button && (
								<div>
									{button.map(({ _uid, label, link }) => {
										const href = resolveStoryblokLink(link, lang, region);

										return (
											<Button key={_uid} variant="outline" size="lg" asChild>
												<NextLink href={href}>{label}</NextLink>
											</Button>
										);
									})}
								</div>
							)}
						</div>
						<div className="hidden shrink-0 lg:block">
							<MakeDonationForm lang={lang} />
						</div>
					</div>
				)}
			</div>
			{!isExpanded && (
				<div className="flex justify-center lg:hidden">
					<MakeDonationForm lang={lang} />
				</div>
			)}
		</div>
	);
};

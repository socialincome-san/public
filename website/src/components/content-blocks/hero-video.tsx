'use client';

import { Button } from '@/components/button';
import { useDonationModal } from '@/components/donation-wizard/hooks/use-donation-modal';
import { VideoControlButton } from '@/components/video-control-button';
import { HeroVideo } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { cn } from '@/lib/utils/cn';
import { ArrowsPointingInIcon, ArrowsPointingOutIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';
import { PauseIcon, PlayIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid';
import MuxVideo from '@mux/mux-video-react';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';
import { useRef, useState, type ReactNode } from 'react';
import Markdown from 'react-markdown';

type Props = {
	blok: HeroVideo;
	lang: WebsiteLanguage;
	subtitleUrl?: string;
	translations: HeroVideoTranslations;
	donationForm: ReactNode;
	disableAutoplay?: boolean;
};

type HeroVideoTranslations = {
	playVideo: string;
	pauseVideo: string;
	muteVideo: string;
	unmuteVideo: string;
	showCaptions: string;
	hideCaptions: string;
	expandVideoView: string;
	exitExpandedVideoView: string;
	donateNow: string;
};

export const HeroVideoBlock = ({ blok, lang, subtitleUrl, translations, donationForm, disableAutoplay = false }: Props) => {
	const { heading, description, muxPlaybackId } = blok;
	const { openWizardAtAmountStep } = useDonationModal();
	const videoRef = useRef<HTMLVideoElement>(null);
	const [isExpanded, setIsExpanded] = useState(false);
	const [isPlaying, setIsPlaying] = useState(!disableAutoplay);
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
		<div {...storyblokEditable(blok as SbBlokData)} className="storyblok__outline full-bleed-hero flex flex-col gap-6">
			<div
				className={cn(
					'bg-foreground relative aspect-video max-h-[80vh] min-h-112 w-full overflow-hidden transition-[border-radius] duration-300 ease-out md:min-h-160',
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
					autoPlay={!disableAutoplay}
					playsInline
					onPlay={() => setIsPlaying(true)}
					onPause={() => setIsPlaying(false)}
				>
					{subtitleUrl && <track kind="captions" src={subtitleUrl} srcLang={lang} label={lang.toUpperCase()} default />}
					<style>{`
            video::cue {
              background-color: hsl(var(--foreground) / 0.8);
              color: hsl(var(--primary-foreground));
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
					<div className="text-primary-foreground w-site-width max-w-content absolute inset-0 z-20 mx-auto mb-8 flex flex-row items-end justify-between gap-4 md:mb-0 md:items-center">
						<div className="flex max-w-2xl flex-col gap-6">
							{heading && (
								<h1 className="text-4xl font-light xl:text-6xl [&_strong]:font-bold">
									<Markdown components={{ p: ({ children }) => <>{children}</> }}>{heading}</Markdown>
								</h1>
							)}
							{description && <p className="text-xl">{description}</p>}
							<div>
								<Button
									type="button"
									variant="outline"
									size="lg"
									aria-haspopup="dialog"
									onClick={() => openWizardAtAmountStep()}
								>
									{translations.donateNow}
								</Button>
							</div>
						</div>
						<div className="hidden shrink-0 lg:block">{donationForm}</div>
					</div>
				)}
			</div>
			{!isExpanded && <div className="w-site-width max-w-content mx-auto w-full px-4 lg:hidden">{donationForm}</div>}
		</div>
	);
};

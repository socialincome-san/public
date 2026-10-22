'use client';
import { useDonationModal } from '@/components/donation-wizard/hooks/use-donation-modal';
import { HeroVideo } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import MuxVideo from '@mux/mux-video-react';
import { Button } from '@socialincome/design-system/actions/button/button';
import { VideoControlButton } from '@socialincome/design-system/actions/video-control-button/video-control-button';
import { cn } from '@socialincome/design-system/cn';
import { MediaHero, MediaHeroIntro } from '@socialincome/design-system/layout/media-hero/media-hero';
import { storyblokEditable } from '@storyblok/react';
import { Maximize2, MessageSquareText, Minimize2, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { preload } from 'react-dom';
import Markdown from 'react-markdown';

type Props = {
	blok: HeroVideo;
	lang: WebsiteLanguage;
	translations: HeroVideoTranslations;
	donationForm: ReactNode;
	disableAutoplay?: boolean;
};

// hls.js keeps buffering up to 600s while under 60MB, so the whole looping video would load upfront.
const HLS_CONFIG = { maxBufferLength: 10, maxMaxBufferLength: 10 };

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

export const HeroVideoBlock = ({ blok, lang, translations, donationForm, disableAutoplay = false }: Props) => {
	const { heading, description, muxPlaybackId } = blok;
	const { openWizardAtAmountStep } = useDonationModal();
	const videoRef = useRef<HTMLVideoElement>(null);
	const [isExpanded, setIsExpanded] = useState(false);
	const [isPlaying, setIsPlaying] = useState(!disableAutoplay);
	const [isMuted, setIsMuted] = useState(true);
	const [showCaptions, setShowCaptions] = useState(true);
	const posterUrl = `https://image.mux.com/${muxPlaybackId}/thumbnail.webp?time=2&width=1600`;
	// The poster is the LCP element and <video> has no fetchpriority attribute.
	preload(posterUrl, { as: 'image', fetchPriority: 'high' });

	// The stream carries a subtitle track per language and the player turns on English by default.
	useEffect(() => {
		const textTracks = videoRef.current?.textTracks;
		if (!textTracks) {
			return;
		}

		const showPageLanguage = () => {
			for (const track of textTracks) {
				if (track.kind !== 'subtitles' && track.kind !== 'captions') {
					continue;
				}
				const mode = track.language === lang ? 'showing' : 'disabled';
				if (track.mode !== mode) {
					track.mode = mode;
				}
			}
		};

		showPageLanguage();
		textTracks.addEventListener('addtrack', showPageLanguage);
		textTracks.addEventListener('change', showPageLanguage);

		return () => {
			textTracks.removeEventListener('addtrack', showPageLanguage);
			textTracks.removeEventListener('change', showPageLanguage);
		};
	}, [lang]);

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
		<MediaHero
			{...storyblokEditable(blok)}
			align="center"
			overlay="none"
			expanded={isExpanded}
			media={
				<MuxVideo
					ref={videoRef}
					className={cn('z-10 size-full', isExpanded ? 'object-contain' : 'object-cover')}
					playbackId={muxPlaybackId}
					disableCookies
					poster={posterUrl}
					capRenditionToPlayerSize
					_hlsConfig={HLS_CONFIG}
					preload="metadata"
					loop
					muted={isMuted}
					autoPlay={!disableAutoplay}
					playsInline
					crossOrigin="anonymous"
					onPlay={() => setIsPlaying(true)}
					onPause={() => setIsPlaying(false)}
				>
					<style>{`
            video::cue {
              background-color: hsl(var(--foreground) / 0.8);
              color: hsl(var(--primary-foreground));
              font-size: 24px;
              opacity: ${isExpanded && showCaptions ? 1 : 0};
            }
          `}</style>
				</MuxVideo>
			}
			controlsStart={
				isExpanded ? (
					<>
						<VideoControlButton
							onClick={togglePlayback}
							aria-label={isPlaying ? translations.pauseVideo : translations.playVideo}
							title={isPlaying ? translations.pauseVideo : translations.playVideo}
						>
							{isPlaying ? <Pause className="size-5" /> : <Play className="size-5" />}
						</VideoControlButton>
						<VideoControlButton
							onClick={() => setIsMuted((prev) => !prev)}
							aria-label={isMuted ? translations.unmuteVideo : translations.muteVideo}
							title={isMuted ? translations.unmuteVideo : translations.muteVideo}
						>
							{isMuted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
						</VideoControlButton>
						<VideoControlButton
							onClick={() => setShowCaptions((prev) => !prev)}
							aria-label={showCaptions ? translations.hideCaptions : translations.showCaptions}
							title={showCaptions ? translations.hideCaptions : translations.showCaptions}
						>
							<MessageSquareText className="size-5" />
						</VideoControlButton>
					</>
				) : null
			}
			controlsEnd={
				<VideoControlButton
					onClick={toggleExpanded}
					aria-label={isExpanded ? translations.exitExpandedVideoView : translations.expandVideoView}
					title={isExpanded ? translations.exitExpandedVideoView : translations.expandVideoView}
				>
					{isExpanded ? <Minimize2 className="size-5" /> : <Maximize2 className="size-5" />}
				</VideoControlButton>
			}
			aside={donationForm}
			mobileAside={donationForm}
		>
			<MediaHeroIntro
				variant="light"
				title={heading ? <Markdown components={{ p: ({ children }) => <>{children}</> }}>{heading}</Markdown> : null}
				description={description}
			>
				<div>
					<Button
						type="button"
						variant="outline-inverse"
						size="lg"
						aria-haspopup="dialog"
						onClick={() => openWizardAtAmountStep()}
					>
						{translations.donateNow}
					</Button>
				</div>
			</MediaHeroIntro>
		</MediaHero>
	);
};

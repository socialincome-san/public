'use client';
import { HeroVideo } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import MuxVideo from '@mux/mux-video-react';
import { VideoControlButton } from '@socialincome/design-system/actions/video-control-button/video-control-button';
import { MediaHero, MediaHeroIntro } from '@socialincome/design-system/layout/media-hero/media-hero';
import { storyblokEditable } from '@storyblok/react';
import { MessageSquareOff, MessageSquareText, Pause, Play, Volume2, VolumeX } from 'lucide-react';
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

// Where subtitles end, in percent of the video height. Browsers put them at the very bottom, under the controls.
const SUBTITLE_BOTTOM_PERCENT = 75;

const liftSubtitles = (event: Event) => {
	const track = event.target;
	if (!(track instanceof TextTrack) || !track.cues) {
		return;
	}

	for (const cue of Array.from(track.cues)) {
		if (cue instanceof VTTCue && cue.line !== SUBTITLE_BOTTOM_PERCENT) {
			cue.snapToLines = false;
			cue.line = SUBTITLE_BOTTOM_PERCENT;
			cue.lineAlign = 'end';
			// Leaves a margin on both sides when a long line wraps.
			cue.size = 90;
		}
	}
};

type HeroVideoTranslations = {
	playVideo: string;
	pauseVideo: string;
	showCaptions: string;
	hideCaptions: string;
	playWithSound: string;
	mute: string;
};

export const HeroVideoBlock = ({ blok, lang, translations, donationForm, disableAutoplay = false }: Props) => {
	const { heading, description, muxPlaybackId } = blok;
	const videoRef = useRef<HTMLVideoElement>(null);
	const [isExpanded, setIsExpanded] = useState(false);
	const [isPlaying, setIsPlaying] = useState(!disableAutoplay);
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
				// The same listener is only added once, however often this runs.
				track.addEventListener('cuechange', liftSubtitles);
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
			for (const track of textTracks) {
				track.removeEventListener('cuechange', liftSubtitles);
			}
		};
	}, [lang]);

	const toggleExpanded = () => {
		const nextExpanded = !isExpanded;
		setIsExpanded(nextExpanded);
		setIsPlaying(true);
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
					className="z-10 size-full object-cover"
					playbackId={muxPlaybackId}
					disableCookies
					poster={posterUrl}
					capRenditionToPlayerSize
					_hlsConfig={HLS_CONFIG}
					preload="metadata"
					loop
					// Browsers only allow sound after a click, so the background video plays muted.
					muted={!isExpanded}
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
              font-size: clamp(16px, 4vw, 24px);
              white-space: normal;
              opacity: ${isExpanded && showCaptions ? 1 : 0};
            }
          `}</style>
				</MuxVideo>
			}
			controlsStart={
				isExpanded ? (
					<>
						<VideoControlButton size="label" onClick={toggleExpanded}>
							<VolumeX className="size-5" />
							{translations.mute}
						</VideoControlButton>
						<VideoControlButton
							onClick={togglePlayback}
							aria-label={isPlaying ? translations.pauseVideo : translations.playVideo}
							title={isPlaying ? translations.pauseVideo : translations.playVideo}
						>
							{isPlaying ? <Pause className="size-5" /> : <Play className="size-5" />}
						</VideoControlButton>
						<VideoControlButton
							onClick={() => setShowCaptions((prev) => !prev)}
							aria-label={showCaptions ? translations.hideCaptions : translations.showCaptions}
							title={showCaptions ? translations.hideCaptions : translations.showCaptions}
						>
							{showCaptions ? <MessageSquareText className="size-5" /> : <MessageSquareOff className="size-5" />}
						</VideoControlButton>
					</>
				) : (
					<VideoControlButton size="label" onClick={toggleExpanded}>
						<Volume2 className="size-5" />
						{translations.playWithSound}
					</VideoControlButton>
				)
			}
			aside={donationForm}
			mobileAside={donationForm}
		>
			<MediaHeroIntro
				variant="light"
				glow
				title={heading ? <Markdown components={{ p: ({ children }) => <>{children}</> }}>{heading}</Markdown> : null}
				description={description}
			/>
		</MediaHero>
	);
};

'use client';

import { DefaultParams } from '@/app/[lang]/[region]';
import { useNavbarBackground } from '@/components/legacy/navbar/useNavbarBackground';
import { PauseIcon, PlayIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid';
import MuxVideo from '@mux/mux-video-react';
import { Button } from '@socialincome/ui';
import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import { useEventListener, useIntersectionObserver } from 'usehooks-ts';

export const OVERLAY_FADE_OUT_DELAY = 4000;
type HeroVideoSubtitles = {
	translations: {
		subtitles: string;
	};
} & DefaultParams;

const MuxVideoComponent = ({ lang, translations }: HeroVideoSubtitles) => {
	const videoElementRef = useRef<HTMLVideoElement>(null);
	const posterRef = useRef<HTMLDivElement>(null);
	const [muted, setMuted] = useState(true);
	const [playing, setPlaying] = useState(false);
	const [showCaptions, setShowCaptions] = useState(true);
	const [showControls, setShowControls] = useState(true);
	const { entry, isIntersecting, ref } = useIntersectionObserver({ initialIsIntersecting: true, threshold: 0.5 });
	const { setBackgroundColor } = useNavbarBackground();
	useEffect(() => {
		if (!entry) {
			return;
		}
		if (!isIntersecting && entry.boundingClientRect.top < 0) {
			setPlaying(false);
			setBackgroundColor('!bg-background');
		} else {
			setPlaying(true);
			setBackgroundColor(null);
		}
		return () => {
			setBackgroundColor(null);
		};
	}, [entry, isIntersecting, setBackgroundColor]);

	useEffect(() => {
		const video = videoElementRef.current;
		if (playing && video) {
			// Hide poster when video is ready
			const handleCanPlay = () => {
				if (posterRef.current) {
					posterRef.current.style.opacity = '0';
					posterRef.current.style.transition = 'opacity 0.5s ease';
				}
			};
			video.addEventListener('canplay', handleCanPlay);
			video.play();
			return () => video.removeEventListener('canplay', handleCanPlay);
		} else {
			videoElementRef.current?.pause();
		}
	}, [playing]);

	const handleShowControls = () => {
		setShowControls(true);
		setShowCaptions(false);
	};

	useEventListener('mousemove', handleShowControls);
	useEventListener('scroll', handleShowControls);

	useEffect(() => {
		let id;
		if (showControls) {
			id = setTimeout(() => setShowControls(false), OVERLAY_FADE_OUT_DELAY);
		}
		if (id) {
			return () => clearTimeout(id);
		}
	}, [showControls, setShowControls]);

	useEffect(() => {
		let id;
		if (!showCaptions) {
			id = setTimeout(() => setShowCaptions(true), OVERLAY_FADE_OUT_DELAY);
		}
		if (id) {
			return () => clearTimeout(id);
		}
	}, [showCaptions, setShowCaptions]);

	return (
		<>
			<div ref={posterRef} className="absolute inset-0 z-0">
				{/* eslint-disable @next/next/no-img-element */}
				<img
					alt="Video Poster"
					className="h-full w-full object-cover"
					src="https://image.mux.com/IPdwilTUVkKs2nK8zKZi5eKwbKhpCWxgsYNVxcANeFE/thumbnail.jpg?time=2"
				/>
			</div>
			<MuxVideo
				ref={videoElementRef}
				className="z-10 h-full w-full object-cover"
				playbackId="IPdwilTUVkKs2nK8zKZi5eKwbKhpCWxgsYNVxcANeFE"
				startTime={2}
				loop
				muted={muted}
				autoPlay={playing}
				playsInline
				onCanPlay={() => setPlaying(true)} // Ensure smooth start
			>
				<track kind="captions" src={translations.subtitles} srcLang={lang} label={lang.toUpperCase()} default />
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
			{/* Transparent element used to track whether navbar should be transparent or not  */}
			<div ref={ref} className="absolute inset-x-0 top-24 z-10 h-2 opacity-100"></div>
			<div
				className={classNames('absolute bottom-16 left-8 z-10 transition duration-500 ease-in-out', {
					'opacity-0': !showControls,
				})}
			>
				<div className="flex flex-row space-x-2">
					<Button
						variant="ghost"
						size="icon"
						className="bg-muted rounded-full p-2.5"
						onClick={() => setPlaying((prevState) => !prevState)}
					>
						{playing ? (
							<PauseIcon className="text-muted-foreground h-6 w-6" />
						) : (
							<PlayIcon className="text-muted-foreground h-6 w-6" />
						)}
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="bg-muted rounded-full p-2.5"
						onClick={() => setMuted((prevState) => !prevState)}
					>
						{muted ? (
							<SpeakerXMarkIcon className="text-muted-foreground h-6 w-6" />
						) : (
							<SpeakerWaveIcon className="text-muted-foreground h-6 w-6" />
						)}
					</Button>
				</div>
			</div>
		</>
	);
};
export default MuxVideoComponent;

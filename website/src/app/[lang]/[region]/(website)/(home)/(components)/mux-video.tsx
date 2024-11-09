'use client';

import { useGlobalStateProvider } from '@/components/providers/global-state-provider';
import { PauseIcon, PlayIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid';
import MuxVideo from '@mux/mux-video-react';
import { Button } from '@socialincome/ui';
import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import { useEventListener, useIntersectionObserver } from 'usehooks-ts';

export const OVERLAY_FADE_OUT_DELAY = 4000;

const MuxVideoComponent = () => {
	const videoElementRef = useRef<HTMLVideoElement>(null);
	const [muted, setMuted] = useState(true);
	const [playing, setPlaying] = useState(false);
	const [showCaptions, setShowCaptions] = useState(true);
	const [showControls, setShowControls] = useState(true);
	const { entry, isIntersecting, ref } = useIntersectionObserver({ initialIsIntersecting: true, threshold: 0.5 });
	const { setBackgroundColor } = useGlobalStateProvider();

	useEffect(() => {
		if (!entry) return;
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
	}, [entry, isIntersecting]);

	useEffect(() => {
		if (playing) {
			videoElementRef.current?.play();
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
		if (id) return () => clearTimeout(id);
	}, [showControls, setShowControls]);

	useEffect(() => {
		let id;
		if (!showCaptions) {
			id = setTimeout(() => setShowCaptions(true), OVERLAY_FADE_OUT_DELAY);
		}
		if (id) return () => clearTimeout(id);
	}, [showCaptions, setShowCaptions]);

	return (
		<>
			<MuxVideo
				ref={videoElementRef}
				className="h-full w-full object-cover"
				playbackId="IPdwilTUVkKs2nK8zKZi5eKwbKhpCWxgsYNVxcANeFE"
				poster="https://image.mux.com/IPdwilTUVkKs2nK8zKZi5eKwbKhpCWxgsYNVxcANeFE/thumbnail.jpg?time=2"
				startTime={2}
				loop
				muted={muted}
				autoPlay={playing}
				playsInline
			>
				<track
					kind="captions"
					src="https://stream.mux.com/IPdwilTUVkKs2nK8zKZi5eKwbKhpCWxgsYNVxcANeFE/text/YZZCqh56kzyMBlwsaPsdlxaFKmlKzNNDKV7oyQb8ECZ4zpXnm500ieA.txt"
					srcLang="en"
					label="English"
					default
				/>
				<style>{`
        video::cue {
          background-color: rgba(0, 0, 0, 0.8);
          color: white;
          font-family: Arial, sans-serif;
          font-size: 24px;
          opacity: ${showCaptions ? 1 : 0};
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

'use client';

import { useNavbarBackgroundColor } from '@/components/navbar/useNavbarBackgroundColor';
import { PauseIcon, PlayIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid';
import MuxVideo from '@mux/mux-video-react';
import { Button } from '@socialincome/ui';
import { useIntersectionObserver } from '@uidotdev/usehooks';
import { useEffect, useRef, useState } from 'react';

const MuxVideoComponent = () => {
	const videoElementRef = useRef<HTMLVideoElement>(null);
	const [muted, setMuted] = useState(true);
	const [playing, setPlaying] = useState(false);
	const [centerVideoElementRef, entry] = useIntersectionObserver();
	const { setBackgroundColor } = useNavbarBackgroundColor();

	useEffect(() => {
		if (entry) {
			if (entry.isIntersecting) {
				// setPlaying(true);
				setBackgroundColor('bg-transparent');
			} else {
				setPlaying(false);
				setBackgroundColor('bg-background');
			}
		}
		return () => {
			setBackgroundColor('bg-background');
		};
	}, [entry]);

	useEffect(() => {
		if (playing) {
			videoElementRef.current?.play();
		} else {
			videoElementRef.current?.pause();
		}
	}, [playing]);

	return (
		<>
			<MuxVideo
				ref={videoElementRef}
				className="h-full w-full object-cover"
				playbackId="KHN8ZJ7Zn7noPy8AHUToA4VSf017EdoKpkKmyp02Wr13o"
				// playbackId="QAjK00JKjEY9lojsht02VLckXDzrETx02glBSQ2WR9y3nk" //Portrait video
				poster="https://image.mux.com/KHN8ZJ7Zn7noPy8AHUToA4VSf017EdoKpkKmyp02Wr13o/thumbnail.jpg?time=0"
				loop
				muted={muted}
				autoPlay={playing}
				playsInline
			/>
			<div ref={centerVideoElementRef} className="absolute inset-x-0 top-3/4 z-10 h-2 opacity-100"></div>
			<div className="absolute bottom-16 left-8 z-10">
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

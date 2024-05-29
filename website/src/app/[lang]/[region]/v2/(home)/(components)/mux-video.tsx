'use client';
import MuxVideo from '@mux/mux-video-react';
import dynamic from 'next/dynamic';

const MuxVideoComponent = () => {
	return (
		<MuxVideo
			// playbackId="QAjK00JKjEY9lojsht02VLckXDzrETx02glBSQ2WR9y3nk" //Portrait video
			playbackId="KHN8ZJ7Zn7noPy8AHUToA4VSf017EdoKpkKmyp02Wr13o"
			poster="https://image.mux.com/KHN8ZJ7Zn7noPy8AHUToA4VSf017EdoKpkKmyp02Wr13o/thumbnail.jpg?time=0"
			muted
			autoPlay
			playsInline
			className="absolute bottom-[calc(1vw-10.5%)] left-0 h-full w-full"
		/>
	);
};

export default dynamic(() => Promise.resolve(MuxVideoComponent), { ssr: false });

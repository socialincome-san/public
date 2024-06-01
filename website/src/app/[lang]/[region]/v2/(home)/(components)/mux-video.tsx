'use client';

import MuxVideo from '@mux/mux-video-react';

const MuxVideoComponent = () => {
	return (
		<MuxVideo
			className="h-full w-full object-cover"
			playbackId="KHN8ZJ7Zn7noPy8AHUToA4VSf017EdoKpkKmyp02Wr13o"
			// playbackId="QAjK00JKjEY9lojsht02VLckXDzrETx02glBSQ2WR9y3nk" //Portrait video
			poster="https://image.mux.com/KHN8ZJ7Zn7noPy8AHUToA4VSf017EdoKpkKmyp02Wr13o/thumbnail.jpg?time=0"
			loop
			muted
			autoPlay
			playsInline
		/>
	);
};

export default MuxVideoComponent;

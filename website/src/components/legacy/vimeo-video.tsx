'use client';

import Player, { VimeoEmbedParameters } from '@vimeo/player';
import { useEffect, useRef } from 'react';

type VimeoVideoProps = {
	videoId: number;
	videoOptions?: VimeoEmbedParameters;
};

export const VimeoVideo = ({ videoId, videoOptions }: VimeoVideoProps) => {
	const playerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (playerRef.current) {
			new Player(playerRef.current, {
				id: videoId,
				controls: true,
				responsive: true,
				...videoOptions,
			});
		}
	}, [videoId, videoOptions]);

	return <div ref={playerRef}></div>;
}

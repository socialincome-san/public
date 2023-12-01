'use client';

import Player, { Options } from '@vimeo/player';
import { useEffect, useRef } from 'react';

type VimeoVideoProps = {
	videoId: number;
	videoOptions?: Options;
};

export function VimeoVideo({ videoId, videoOptions }: VimeoVideoProps) {
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

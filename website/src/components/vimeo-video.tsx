'use client';

import Player from '@vimeo/player';
import { useEffect, useRef } from 'react';

export function VimeoVideo({ videoId }: { videoId: number }) {
	const playerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (playerRef.current) {
			new Player(playerRef.current, {
				id: videoId,
				controls: true,
				responsive: true,
			});
		}
	}, [videoId]);

	return <div ref={playerRef}></div>;
}

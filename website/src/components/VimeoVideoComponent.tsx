'use client';

import Player from '@vimeo/player';
import { useEffect, useRef } from 'react';

export function VimeoVideoComponent({ vimeoVideoId }: { vimeoVideoId: number }) {
	const playerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (playerRef.current) {
			new Player(playerRef.current, {
				id: vimeoVideoId,
				controls: true,
				responsive: true,
			});
		}
	}, [vimeoVideoId]);

	return <div ref={playerRef}></div>;
}

'use client';

import { PlayCircleIcon } from '@heroicons/react/24/outline';
import { BaseContainer, Dialog, DialogContent, DialogTrigger, Typography } from '@socialincome/ui';
import Player from '@vimeo/player';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import houseGif from './house.gif';

type Section2Props = {
	vimeoVideoId: number;
	translations: {
		title1: string;
		title2: string;
		subtitle1: string;
		videoButton: string;
	};
};

export default function Section2({ vimeoVideoId, translations }: Section2Props) {
	const playerRef = useRef<HTMLDivElement>(null);
	const [player, setPlayer] = useState<Player | null>(null);
	const [showModal, setShowModal] = useState(false);

	useEffect(() => {
		if (playerRef.current) {
			setPlayer(
				new Player(playerRef.current, {
					id: vimeoVideoId,
					controls: true,
					responsive: true,
				}),
			);
		}
	}, [playerRef, vimeoVideoId]);

	useEffect(() => {
		void player?.pause();
	}, [player, showModal]);

	return (
		<BaseContainer>
			<div className="flex min-h-screen flex-col items-center justify-center lg:flex-row">
				<div className="flex flex-1 flex-col justify-center p-4 text-center lg:p-8 lg:text-left">
					<Typography as="span" size="4xl" weight="bold" lineHeight="relaxed">
						{translations.title1}
					</Typography>
					<Typography as="span" size="4xl" weight="bold" color="secondary" lineHeight="relaxed">
						{translations.title2}
					</Typography>
					<Typography size="xl" className="mt-4">
						{translations.subtitle1}
					</Typography>
				</div>
				<div className="flex flex-1 flex-col items-center">
					<div className="group cursor-pointer" onClick={() => setShowModal((prevState) => !prevState)}>
						<Image className="px-16 py-4" src={houseGif} alt="House Animation for Video Preview" />
						<Dialog>
							<DialogTrigger>
								<div className="my-1 flex h-12 flex-row items-center justify-center space-x-2 group-hover:my-0 group-hover:h-14 group-hover:transition-all">
									<PlayCircleIcon className="h-full"></PlayCircleIcon>
									<Typography className="text-xl group-hover:text-2xl group-hover:transition-all" weight="medium">
										{translations.videoButton}
									</Typography>
								</div>
							</DialogTrigger>
							<DialogContent>
								<div className="w-11/12 max-w-6xl" ref={playerRef} />
							</DialogContent>
						</Dialog>
					</div>
				</div>
			</div>
		</BaseContainer>
	);
}

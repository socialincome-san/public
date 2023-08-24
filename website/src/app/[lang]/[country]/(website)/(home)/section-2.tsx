'use client';

import { DefaultPageProps } from '@/app/[lang]/[country]';
import { PlayCircleIcon } from '@heroicons/react/24/outline';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Modal, Typography } from '@socialincome/ui';
import { useQuery } from '@tanstack/react-query';
import Player from '@vimeo/player';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import houseGif from './house.gif';

export default function Section2({ params }: DefaultPageProps) {
	const playerRef = useRef<HTMLDivElement>(null);
	const [player, setPlayer] = useState<Player | null>(null);
	const [showModal, setShowModal] = useState(false);
	const { data: translator } = useQuery(
		[params.lang],
		async () =>
			Translator.getInstance({
				language: params.lang,
				namespaces: ['website-home'],
			}),
		{
			staleTime: Infinity, // never refetch
		},
	);

	useEffect(() => {
		if (playerRef.current && translator) {
			setPlayer(
				new Player(playerRef.current, {
					id: Number(translator.t('section-2.vimeo-video-id')),
					controls: true,
					responsive: true,
				}),
			);
		}
	}, [playerRef, translator]);

	useEffect(() => {
		void player?.pause();
	}, [player, showModal]);

	return (
		<BaseContainer className="bg-base-yellow">
			<div className="flex min-h-screen flex-col items-center justify-center lg:flex-row">
				<div className="flex flex-1 flex-col justify-center p-4 text-center lg:p-8 lg:text-left">
					<Typography as="span" size="4xl" weight="bold" lineHeight="relaxed">
						{translator?.t('section-2.title-1')}
					</Typography>
					<Typography as="span" size="4xl" weight="bold" color="accent" lineHeight="relaxed">
						{translator?.t('section-2.title-2')}
					</Typography>
					<Typography size="xl" className="mt-4">
						{translator?.t('section-2.subtitle-1')}
					</Typography>
				</div>
				<div className="flex flex-1 flex-col items-center">
					<div className="group cursor-pointer" onClick={() => setShowModal((prevState) => !prevState)}>
						<Image className="px-16 py-4" src={houseGif} alt="House Animation for Video Preview" />
						<div className="my-1 flex h-12 flex-row items-center justify-center space-x-2 group-hover:my-0 group-hover:h-14 group-hover:transition-all">
							<PlayCircleIcon className="h-full"></PlayCircleIcon>
							<Typography className="text-xl group-hover:text-2xl group-hover:transition-all" weight="medium">
								{translator?.t('section-2.video-button')}
							</Typography>
						</div>
						<Modal open={showModal} className="w-11/12 max-w-7xl">
							<Modal.Body ref={playerRef} />
						</Modal>
					</div>
				</div>
			</div>
		</BaseContainer>
	);
}

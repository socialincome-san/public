'use client';

import { DefaultParams } from '@/app/[lang]/[region]';
import { OVERLAY_FADE_OUT_DELAY } from '@/app/[lang]/[region]/(website)/(home)/(components)/mux-video';
import { Button, Typography } from '@socialincome/ui';
import { FontColor } from '@socialincome/ui/src/interfaces/color';
import classNames from 'classnames';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useEventListener } from 'usehooks-ts';

type HeroVideoOverlayProps = {
	translations: {
		buttonText: string;
		mainText: { text: string; color?: FontColor }[];
	};
} & DefaultParams;

const HeroVideoOverlay = ({ lang, region, translations }: HeroVideoOverlayProps) => {
	const [hideOverlay, setHideOverlay] = useState(false);

	useEffect(() => {
		let id;
		if (!hideOverlay) {
			id = setTimeout(() => setHideOverlay(true), OVERLAY_FADE_OUT_DELAY);
		}
		if (id) return () => clearTimeout(id);
	}, [hideOverlay, setHideOverlay]);

	useEventListener('mousemove', () => setHideOverlay(false));

	return (
		<div
			className={classNames('absolute inset-2 transition duration-500 ease-in-out', {
				'opacity-0': hideOverlay,
			})}
		>
			<div className=" flex h-full flex-col justify-around">
				<div className="hidden md:block" />
				<div className="mx-auto max-w-4xl text-center text-white">
					{translations.mainText.map((title, index) => (
						<Typography
							key={index}
							as="span"
							weight="medium"
							color={title.color}
							className="text-3xl sm:text-4xl md:text-6xl"
						>
							{title.text}{' '}
						</Typography>
					))}
				</div>
				<Link href={`/${lang}/${region}/donate/individual`}>
					<Button className="mx-auto hidden md:block">
						<Typography>{translations.buttonText}</Typography>
					</Button>
				</Link>
			</div>
		</div>
	);
};

export default HeroVideoOverlay;

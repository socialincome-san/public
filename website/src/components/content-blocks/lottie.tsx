'use client';

import type { Lottie } from '@/generated/storyblok/types/109655/storyblok-components';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';

type Props = {
	blok: Lottie;
};

export const LottieBlock = ({ blok }: Props) => {
	if (!blok.animation?.filename) {
		return null;
	}

	return (
		<div {...storyblokEditable(blok as SbBlokData)}>
			<DotLottieReact src={blok.animation.filename} loop autoplay />
		</div>
	);
};

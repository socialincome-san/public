'use client';

import { LOTTIE_WASM_PUBLIC_PATH } from '@/components/content-blocks/lottie-wasm';
import type { Lottie } from '@/generated/storyblok/types/109655/storyblok-components';
import { DotLottieReact, setWasmUrl } from '@lottiefiles/dotlottie-react';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';

type Props = {
	blok: Lottie;
};

setWasmUrl(LOTTIE_WASM_PUBLIC_PATH);

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

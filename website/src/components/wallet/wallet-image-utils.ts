import type { StoryblokAsset } from '@/generated/storyblok/types/storyblok';
import { formatStoryblokUrl } from '@/lib/services/storyblok/storyblok.utils';
import type { WalletImage } from './wallet.types';

const WALLET_IMAGE_WIDTH = 760;
const WALLET_IMAGE_HEIGHT = 400;

export const createWalletImageFromStoryblokAsset = (
	asset: Pick<StoryblokAsset, 'filename' | 'alt' | 'focus'> | undefined,
	fallbackAlt: string,
	fallbackImage?: WalletImage | null,
): WalletImage | null => {
	if (!asset?.filename) {
		return fallbackImage ? { ...fallbackImage, alt: asset?.alt ?? fallbackAlt } : null;
	}

	return {
		src: formatStoryblokUrl(asset.filename, WALLET_IMAGE_WIDTH, WALLET_IMAGE_HEIGHT, asset.focus),
		alt: asset.alt ?? fallbackAlt,
		focus: asset.focus,
	};
};

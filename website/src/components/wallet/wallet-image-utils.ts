import type { StoryblokAsset } from '@/generated/storyblok/types/storyblok';
import { formatStoryblokUrl } from '@/lib/services/storyblok/storyblok.utils';
import type { WalletImage } from './wallet.types';

const WALLET_IMAGE_WIDTH = 760;
const WALLET_IMAGE_HEIGHT = 400;
export const WALLET_IMAGE_SIZES = '(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw';

export const createWalletImageFromStoryblokAsset = (
	asset: Pick<StoryblokAsset, 'filename' | 'alt' | 'focus'> | undefined,
	fallbackAlt: string,
	fallbackImage?: WalletImage | null,
	options?: { preserveFallbackAlt?: boolean },
): WalletImage | null => {
	if (!asset?.filename) {
		if (!fallbackImage) {
			return null;
		}

		return {
			...fallbackImage,
			alt: options?.preserveFallbackAlt ? fallbackImage.alt : (asset?.alt ?? fallbackAlt),
		};
	}

	return {
		src: formatStoryblokUrl(asset.filename, WALLET_IMAGE_WIDTH, WALLET_IMAGE_HEIGHT, asset.focus),
		alt: asset.alt ?? fallbackAlt,
	};
};

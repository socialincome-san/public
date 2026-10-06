import type { StoryblokAsset } from '@/generated/storyblok/types/storyblok';
import { formatStoryblokUrl } from '@/lib/storyblok/storyblok-utils';
import { type WalletImage } from '@socialincome/design-system/data-display/wallet/wallet';

const WALLET_IMAGE_WIDTH = 760;
const WALLET_IMAGE_HEIGHT = 400;

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

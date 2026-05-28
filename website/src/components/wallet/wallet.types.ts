import type { ReactNode } from 'react';

export type WalletImage = {
	src: string;
	alt: string;
};

export type WalletImages = {
	primaryImage: WalletImage;
	hoverEffectImage1: WalletImage;
	hoverEffectImage2: WalletImage;
};

export type WalletFooterColumn = {
	label: string;
	prefix?: string | null;
	value: string;
};

export type WalletVariant = 'default' | 'empty';

export type WalletBadge = ReactNode;

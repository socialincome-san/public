import type { ReactNode } from 'react';

export type WalletImage = {
	src: string;
	alt: string;
};

export type WalletImages = {
	mainImage: WalletImage;
	extraImage1: WalletImage;
	extraImage2: WalletImage;
};

export type WalletPaidOut = {
	label: string;
	currency: string | null;
	amount: number;
};

export type WalletRecipientCount = {
	label: string;
	amount: number;
};

export type WalletVariant = 'default' | 'empty';

export type WalletBadge = ReactNode;


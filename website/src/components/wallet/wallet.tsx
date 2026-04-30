'use client';

import { Card } from '@/components/card';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { WalletFront } from './wallet-front';
import { WalletImageStack } from './wallet-image-stack';
import { WalletOverlayImages } from './wallet-overlay-images';
import type { WalletBadge, WalletImages, WalletPaidOut, WalletRecipientCount, WalletVariant } from './wallet.types';

type WalletProps = {
	variant?: WalletVariant;
	programName: string;
	country?: string | null;
	badge?: WalletBadge;
	paidOut?: WalletPaidOut;
	amountOfRecipients?: WalletRecipientCount;
	linkHref?: string;
	images?: WalletImages;
};

export const Wallet = ({
	variant = 'default',
	programName,
	country,
	badge,
	paidOut,
	amountOfRecipients,
	linkHref,
	images,
}: WalletProps) => {
	type WalletStyle = CSSProperties & Record<`--${string}`, string>;

	const walletStyle: WalletStyle = {
		'--slant-shift': '50px',
		'--slant-width': '40px',
		'--slant-height': '14px',
		'--slant-position': 'calc(var(--slant-shift) + var(--slant-width))',
		'--gradient': 'linear-gradient(to right, hsl(var(--gradient-card-from)), hsl(var(--gradient-card-to)))',
		'--shadow-size': '11px',
		'--stack-height': images?.mainImage?.src ? '180px' : '28px',
		'--wallet-front-bg': variant === 'default' ? 'var(--gradient)' : 'hsl(var(--card))',
		'--wallet-front-box-shadow':
			variant === 'default'
				? 'none'
				: '0 0 0 var(--shadow-size) rgba(255,255,255,0.5), 0 0 0 calc(2* var(--shadow-size)) rgba(255,255,255,0.3)',
		'--wallet-back-bg': variant === 'default' ? 'var(--gradient)' : 'hsl(var(--secondary))',
		'--wallet-cards-background': variant === 'default' ? 'hsl(var(--card))' : 'none',
		'--wallet-cards-box-shadow':
			variant === 'default'
				? images?.mainImage?.src
					? '0 0 0 var(--shadow-size) rgba(255,255,255,0.3)'
					: '0 0 0 var(--shadow-size) rgba(255,255,255,0.5), 0 0 0 calc(2* var(--shadow-size)) rgba(255,255,255,0.3)'
				: 'none',
		'--text-color': variant === 'default' ? 'hsl(var(--card))' : 'inherit',
	};

	const content = (
		<div className="group relative h-full" style={walletStyle} data-testid="wallet">
			<Card
				variant="noPadding"
				className="flex h-full max-w-full cursor-pointer flex-col overflow-hidden transition hover:shadow-xs"
			>
				<WalletImageStack images={images} />
				<WalletFront
					variant={variant}
					programName={programName}
					country={country}
					badge={badge}
					paidOut={paidOut}
					amountOfRecipients={amountOfRecipients}
				/>
			</Card>
			<WalletOverlayImages images={images} />
		</div>
	);

	return linkHref ? (
		<Link href={linkHref} className="block h-full">
			{content}
		</Link>
	) : (
		content
	);
};

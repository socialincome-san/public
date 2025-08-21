import { Card } from '@/app/portal/components/card';
import { ReactNode } from 'react';

type WalletProps = {
	variant?: 'default' | 'empty';
	children: ReactNode;
};

export function Wallet({ variant = 'default', children }: WalletProps) {
	return (
		<Card
			variant="noPadding"
			className="flex aspect-[1.4] min-h-full max-w-full flex-col overflow-hidden transition hover:shadow-sm"
			style={{
				['--slant-shift' as any]: '50px',
				['--slant-width' as any]: '40px',
				['--slant-height' as any]: '14px',
				['--slant-position' as any]: 'calc(var(--slant-shift) + var(--slant-width))',
				['--gradient' as any]:
					'linear-gradient(to right, hsl(var(--gradient-button-from)), hsl(var(--gradient-button-to)))', // TODO: add correct gradient colors
				['--shadow-size' as any]: '11px',
				['--stack-height' as any]: '28px',
				['--wallet-front-bg' as any]: variant === 'default' ? 'var(--gradient)' : 'hsl(var(--card))', // TODO: set correct background color for white
				['--wallet-front-box-shadow' as any]:
					variant === 'default'
						? 'none'
						: '0 0 0 var(--shadow-size) rgba(255,255,255,0.5), 0 0 0 calc(2* var(--shadow-size)) rgba(255,255,255,0.3)',
				['--wallet-back-bg' as any]: variant === 'default' ? 'var(--gradient)' : 'hsl(var(--card))',
				['--wallet-cards-background' as any]: variant === 'default' ? 'hsl(var(--card))' : 'none',
				['--wallet-cards-box-shadow' as any]:
					variant === 'default'
						? '0 0 0 var(--shadow-size) rgba(255,255,255,0.5), 0 0 0 calc(2* var(--shadow-size)) rgba(255,255,255,0.3)'
						: 'none',
				['--text-color' as any]: variant === 'default' ? 'hsl(var(--card))' : 'inherit',
			}}
		>
			{/* Wallet header with card stack */}
			<div
				className="-mb-[var(--slant-height)] flex flex-col"
				style={{
					background: 'var(--wallet-back-bg)',
				}}
			>
				<div
					className="relative m-[calc(3*var(--shadow-size))] mb-0 h-[var(--stack-height)] rounded-sm"
					style={{
						boxShadow: 'var(--wallet-cards-box-shadow)',
						background: 'var(--wallet-cards-background)',
					}}
				></div>
			</div>

			{/* Wallet content */}
			<div
				className="flex flex-1"
				style={{
					filter: 'drop-shadow(0 4px 20px rgba(0, 0, 0, 0.09))',
				}}
			>
				<div
					className="flex-1 pt-9 text-[--gradient]"
					style={{
						color: 'var(--text-color)',
						background: 'var(--wallet-front-bg)',
						clipPath:
							'polygon(100% 0%, 100% 100%, 0% 100%, 0% 0%, var(--slant-shift) 0%, var(--slant-position) var(--slant-height), calc(100% - var(--slant-position)) var(--slant-height), calc(100% - var(--slant-shift)) 0%)',
					}}
				>
					{children}
				</div>
			</div>
		</Card>
	);
}

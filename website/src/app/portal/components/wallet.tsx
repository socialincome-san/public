'use client';

import { Button } from '@/app/portal/components/button';
import { Card } from '@/app/portal/components/card';
import { PlusIcon } from 'lucide-react';
import Link from 'next/link';

type WalletProps = {
	variant?: 'default' | 'empty';
	title: string;
	subtitle?: string | null;
	footerLeft?: { label: string; currency: string | null; amount: number };
	footerRight?: { label: string; amount: number };
	href?: string;
	onClick?: () => void;
};

export function Wallet({ variant = 'default', title, subtitle, footerLeft, footerRight, href, onClick }: WalletProps) {
	const renderContent = () => (
		<Card
			variant="noPadding"
			className="flex min-h-full max-w-full flex-col overflow-hidden transition hover:shadow-sm"
			style={{
				['--slant-shift' as any]: '50px',
				['--slant-width' as any]: '40px',
				['--slant-height' as any]: '14px',
				['--slant-position' as any]: 'calc(var(--slant-shift) + var(--slant-width))',
				['--gradient' as any]:
					'linear-gradient(to right, hsl(var(--gradient-card-from)), hsl(var(--gradient-card-to)))',
				['--shadow-size' as any]: '11px',
				['--stack-height' as any]: '28px',
				['--wallet-front-bg' as any]: variant === 'default' ? 'var(--gradient)' : 'hsl(var(--card))',
				['--wallet-front-box-shadow' as any]:
					variant === 'default'
						? 'none'
						: '0 0 0 var(--shadow-size) rgba(255,255,255,0.5), 0 0 0 calc(2* var(--shadow-size)) rgba(255,255,255,0.3)',
				['--wallet-back-bg' as any]: variant === 'default' ? 'var(--gradient)' : 'hsl(var(--secondary))',
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
				className="flex aspect-[1.9] flex-1"
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
					<div className="h-full p-8 pb-6 pt-0">
						{variant === 'default' ? (
							<div className="flex h-full w-full flex-col items-start justify-between gap-2">
								<div>
									<h3 className="text-4xl font-normal leading-[1.3]">{title}</h3>
									<p className="pb-2 text-sm font-medium tracking-wide">{subtitle}</p>
								</div>
								<div className="flex w-full items-start justify-between">
									<div className="flex flex-col items-start">
										<p className="text-sm font-medium tracking-wide">{footerLeft?.label}</p>
										<p className="text-4xl font-normal">
											<small className="text-lg">{footerLeft?.currency}</small> {footerLeft?.amount}
										</p>
									</div>
									<div className="flex flex-col items-end">
										<p className="text-sm font-medium tracking-wide">{footerRight?.label}</p>
										<p className="text-4xl font-normal">{footerRight?.amount}</p>
									</div>
								</div>
							</div>
						) : (
							<div className="flex h-full flex-col items-center justify-center gap-4">
								<Button variant="secondary" size="icon" className="h-12 w-12 rounded-full shadow-sm" aria-label="Add">
									<PlusIcon className="h-6 w-6" />
								</Button>
								<p className="text-2xl">{title}</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</Card>
	);

	return (
		<>
			{variant === 'default' && href ? (
				<Link href={href}>{renderContent()}</Link>
			) : (
				<div onClick={onClick}>{renderContent()}</div>
			)}
		</>
	);
}

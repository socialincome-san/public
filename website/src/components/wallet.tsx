'use client';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { PlusIcon } from 'lucide-react';
import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';

type WalletProps = {
	variant?: 'default' | 'empty';
	title: string;
	subtitle?: string | null;
	badge?: ReactNode;
	footerLeft?: { label: string; currency: string | null; amount: number };
	footerRight?: { label: string; amount: number };
	href?: string;
	imageHref?: string;
	imageAlt?: string;
	imageHrefs?: readonly [string, string, string] | readonly [string, string];
};

const formatAmount = (amount?: number): string => {
	if (amount === null || amount === undefined || isNaN(amount)) {
		return '';
	}

	return new Intl.NumberFormat('de-CH', {
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(amount);
};

export const Wallet = ({
	variant = 'default',
	title,
	subtitle,
	badge,
	footerLeft,
	footerRight,
	href,
	imageHref,
	imageAlt,
	imageHrefs,
}: WalletProps) => {
	type WalletStyle = CSSProperties & Record<`--${string}`, string>;

	const images: readonly string[] = imageHrefs ?? (imageHref ? [imageHref] : []);
	const hasImages = images.length > 0;
	const primaryImageHref = hasImages ? images[0]! : undefined;
	const secondaryImageHref = images[1];
	const tertiaryImageHref = images[2];

	const walletStyle: WalletStyle = {
		'--slant-shift': '50px',
		'--slant-width': '40px',
		'--slant-height': '14px',
		'--slant-position': 'calc(var(--slant-shift) + var(--slant-width))',
		'--gradient': 'linear-gradient(to right, hsl(var(--gradient-card-from)), hsl(var(--gradient-card-to)))',
		'--shadow-size': '11px',
		'--stack-height': primaryImageHref ? '180px' : '28px',
		'--wallet-front-bg': variant === 'default' ? 'var(--gradient)' : 'hsl(var(--card))',
		'--wallet-front-box-shadow':
			variant === 'default'
				? 'none'
				: '0 0 0 var(--shadow-size) rgba(255,255,255,0.5), 0 0 0 calc(2* var(--shadow-size)) rgba(255,255,255,0.3)',
		'--wallet-back-bg': variant === 'default' ? 'var(--gradient)' : 'hsl(var(--secondary))',
		'--wallet-cards-background': variant === 'default' ? 'hsl(var(--card))' : 'none',
		'--wallet-cards-box-shadow':
			variant === 'default'
				? primaryImageHref
					? '0 0 0 var(--shadow-size) rgba(255,255,255,0.3)'
					: '0 0 0 var(--shadow-size) rgba(255,255,255,0.5), 0 0 0 calc(2* var(--shadow-size)) rgba(255,255,255,0.3)'
				: 'none',
		'--text-color': variant === 'default' ? 'hsl(var(--card))' : 'inherit',
	};

	const content = (
		<div className="group relative h-full" style={walletStyle}>
			<Card
				variant="noPadding"
				className="flex h-full max-w-full cursor-pointer flex-col overflow-hidden transition hover:shadow-xs"
			>
				<div className="-mb-(--slant-height) flex flex-col" style={{ background: 'var(--wallet-back-bg)' }}>
					<div
						className={`relative mb-0 h-(--stack-height) overflow-hidden rounded-sm ${
							primaryImageHref ? 'm-[calc(2*var(--shadow-size))]' : 'm-[calc(3*var(--shadow-size))]'
						}`}
						style={{ boxShadow: 'var(--wallet-cards-box-shadow)', background: 'var(--wallet-cards-background)' }}
					>
						{primaryImageHref ? (
							<>
								{tertiaryImageHref ? (
									<div
										className="absolute inset-0 rounded-sm bg-cover bg-center"
										style={{ backgroundImage: `url(${tertiaryImageHref})` }}
										aria-label=""
									/>
								) : null}
								{secondaryImageHref ? (
									<div
										className="absolute inset-0 origin-bottom rounded-sm bg-cover bg-center transition duration-300 ease-out will-change-transform group-hover:-translate-y-5 group-hover:translate-x-1 group-hover:rotate-[5deg] motion-reduce:transform-none motion-reduce:transition-none"
										style={{ backgroundImage: `url(${secondaryImageHref})` }}
										aria-label=""
									/>
								) : null}
								<div
									className="absolute inset-0 origin-bottom rounded-sm bg-cover bg-center transition duration-300 ease-out will-change-transform group-hover:-translate-y-7 group-hover:-translate-x-1 group-hover:-rotate-5 motion-reduce:transform-none motion-reduce:transition-none"
									style={{ backgroundImage: `url(${primaryImageHref})` }}
									aria-label={imageAlt}
									role={imageAlt ? 'img' : undefined}
								/>
							</>
						) : null}
					</div>
				</div>

				<div
					className="flex aspect-[1.9] flex-1"
					style={{ filter: 'drop-shadow(0 4px 20px rgba(0, 0, 0, 0.09))' }}
				>
					<div
						className="flex-1 pt-9"
						style={{
							color: 'var(--text-color)',
							background: 'var(--wallet-front-bg)',
							clipPath:
								'polygon(100% 0%, 100% 100%, 0% 100%, 0% 0%, var(--slant-shift) 0%, var(--slant-position) var(--slant-height), calc(100% - var(--slant-position)) var(--slant-height), calc(100% - var(--slant-shift)) 0%)',
						}}
					>
						<div className="h-full p-8 pt-0 pb-6">
							{variant === 'default' ? (
								<div className="flex h-full w-full flex-col items-start justify-between gap-2">
									<div>
										<h3 className="min-h-[2.6em] text-4xl leading-[1.3] font-normal line-clamp-2">{title}</h3>
										<p className="min-h-[1.25rem] text-sm leading-5 font-medium tracking-wide line-clamp-1">{subtitle}</p>
										{badge && <div className="mt-1">{badge}</div>}
									</div>
									<div className="flex w-full items-start justify-between">
										<div className="flex flex-col items-start">
											<p className="text-sm font-medium tracking-wide">{footerLeft?.label}</p>
											<p className="text-4xl font-normal">
												<small className="text-lg">{footerLeft?.currency}</small> {formatAmount(footerLeft?.amount)}
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
									<Button variant="secondary" size="icon" className="h-12 w-12 rounded-full shadow-xs" aria-label="Add">
										<PlusIcon className="h-6 w-6" />
									</Button>
								<p className="min-h-[2.5em] text-center text-2xl leading-[1.25] line-clamp-2">{title}</p>
								</div>
							)}
						</div>
					</div>
				</div>
			</Card>

			{primaryImageHref ? (
				<div
					className="pointer-events-none absolute z-20"
					style={{
						top: 'calc(2 * var(--shadow-size))',
						left: 'calc(2 * var(--shadow-size))',
						right: 'calc(2 * var(--shadow-size))',
						height: 'var(--stack-height)',
					}}
				>
					<div
						className="h-full w-full overflow-visible rounded-sm"
						style={{
							clipPath:
								'inset(calc(-4 * var(--shadow-size)) calc(-2 * var(--shadow-size)) calc(2 * var(--shadow-size)) calc(-2 * var(--shadow-size)) round 2px)',
						}}
					>
						{secondaryImageHref ? (
							<div
								className="absolute inset-0 origin-bottom rounded-sm bg-cover bg-center transition duration-300 ease-out will-change-transform group-hover:-translate-y-4 group-hover:translate-x-1 group-hover:rotate-[5deg] motion-reduce:transform-none motion-reduce:transition-none"
								style={{ backgroundImage: `url(${secondaryImageHref})` }}
								aria-label=""
							/>
						) : null}
						<div
							className="h-full w-full origin-bottom rounded-sm bg-cover bg-center transition duration-300 ease-out will-change-transform group-hover:-translate-y-7 group-hover:-translate-x-1 group-hover:-rotate-5 motion-reduce:transform-none motion-reduce:transition-none"
							style={{ backgroundImage: `url(${primaryImageHref})` }}
							aria-label={imageAlt}
							role={imageAlt ? 'img' : undefined}
						/>
					</div>
				</div>
			) : null}
		</div>
	);

	return href ? (
		<Link href={href} className="block h-full">
			{content}
		</Link>
	) : (
		content
	);
};

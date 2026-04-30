import { Card } from '@/components/card';
import Link from 'next/link';
import type { CSSProperties } from 'react';

// Figma grid pocket overlay ("Subtract" shape that creates the pocket edge)
const imgWalletPocketOverlay = 'https://www.figma.com/api/mcp/asset/3da87860-60b2-45bf-9c8c-599125c16a7c';

type ProgramImageWalletProps = {
	image: { src: string; alt?: string };
	href?: string;
};

export const ProgramImageWallet = ({ image, href }: ProgramImageWalletProps) => {
	type WalletStyle = CSSProperties & Record<`--${string}`, string>;

	// "Higher lip" variant (matches the Figma grid proportion better)
	const walletStyle: WalletStyle = {
		'--slant-shift': '50px',
		'--slant-width': '40px',
		'--slant-height': '22px',
		'--slant-position': 'calc(var(--slant-shift) + var(--slant-width))',
		'--gradient': 'linear-gradient(to right, hsl(var(--gradient-card-from)), hsl(var(--gradient-card-to)))',
		'--shadow-size': '11px',
		'--stack-height': '28px',
	};

	const content = (
		<Card
			variant="noPadding"
			className="bg-background relative flex h-[469px] w-[405px] cursor-pointer flex-col overflow-visible rounded-3xl shadow-lg"
			// eslint-disable-next-line react/forbid-component-props
			style={walletStyle}
		>
			{/* Wallet "lip" (same structure as non-image wallet) */}
			<div className="-mb-(--slant-height) flex flex-col" style={{ background: 'var(--gradient)' }}>
				<div
					className="relative m-[calc(3*var(--shadow-size))] mb-0 h-(--stack-height) rounded-sm"
					style={{
						boxShadow:
							'0 0 0 var(--shadow-size) rgba(255,255,255,0.5), 0 0 0 calc(2* var(--shadow-size)) rgba(255,255,255,0.3)',
						background: 'hsl(var(--card))',
					}}
				/>
			</div>

			<div className="flex flex-1" style={{ filter: 'drop-shadow(0 4px 20px rgba(0, 0, 0, 0.09))' }}>
				<div
					className="group relative flex-1 overflow-hidden"
					style={{
						background: 'var(--gradient)',
						clipPath:
							'polygon(100% 0%, 100% 100%, 0% 100%, 0% 0%, var(--slant-shift) 0%, var(--slant-position) var(--slant-height), calc(100% - var(--slant-position)) var(--slant-height), calc(100% - var(--slant-shift)) 0%)',
					}}
				>
					{/* Image area (straight top edge); pocket shape is only at the bottom */}
					<div className="absolute top-8 right-5 left-5 h-[252px] rounded-2xl">
						<div className="absolute inset-0 overflow-hidden rounded-2xl">
							<img
								alt={image.alt ?? ''}
								src={image.src}
								className="-mt-14 h-[340px] w-full object-cover opacity-95 transition duration-300 ease-out will-change-transform group-hover:-translate-y-12 motion-reduce:transform-none motion-reduce:transition-none"
								loading="lazy"
								decoding="async"
							/>
						</div>
					</div>

					{/* Pocket edge should be at the BOTTOM of the image area (like Figma) */}
					<div className="pointer-events-none absolute inset-x-0 top-[206px] h-[120px]">
						<div className="absolute top-[3px] right-[19px] left-[19px] h-[55px] bg-black/40 blur-[18px]" />
						<div className="absolute top-[27px] right-[19px] left-[19px] h-[55px] bg-black/40 blur-[18px]" />
						<img alt="" src={imgWalletPocketOverlay} className="absolute inset-0 h-full w-full object-cover" />
					</div>
				</div>
			</div>
		</Card>
	);

	return href ? <Link href={href}>{content}</Link> : content;
};

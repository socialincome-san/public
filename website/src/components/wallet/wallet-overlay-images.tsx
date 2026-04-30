import { cn } from '@/lib/utils/cn';
import type { WalletImages } from './wallet.types';

export type WalletOverlayImagesProps = {
	images?: WalletImages;
};

export const WalletOverlayImages = ({ images }: WalletOverlayImagesProps) => {
	const main = images?.mainImage;
	const extra1 = images?.extraImage1;

	if (!main?.src) {
		return null;
	}

	return (
		<div
			className={cn(
				'pointer-events-none absolute z-20 h-(--stack-height)',
				'top-[calc(2*var(--shadow-size))]',
				'right-[calc(2*var(--shadow-size))]',
				'left-[calc(2*var(--shadow-size))]',
			)}
			data-testid="wallet-overlay-images"
		>
			<div
				className={cn(
					'h-full w-full overflow-visible rounded-sm',
					'[clip-path:inset(calc(-4*var(--shadow-size))_calc(-2*var(--shadow-size))_calc(2*var(--shadow-size))_calc(-2*var(--shadow-size))_round_2px)]',
				)}
			>
				{extra1?.src ? (
					<div
						className="absolute inset-0 origin-bottom rounded-sm bg-cover bg-center transition duration-300 ease-out will-change-transform group-hover:translate-x-1 group-hover:-translate-y-4 group-hover:rotate-[5deg] motion-reduce:transform-none motion-reduce:transition-none"
						style={{ backgroundImage: `url(${extra1.src})` }}
						aria-label=""
					/>
				) : null}
				<div
					className="h-full w-full origin-bottom rounded-sm bg-cover bg-center transition duration-300 ease-out will-change-transform group-hover:-translate-x-1 group-hover:-translate-y-7 group-hover:-rotate-5 motion-reduce:transform-none motion-reduce:transition-none"
					style={{ backgroundImage: `url(${main.src})` }}
					aria-label={main.alt}
					role={main.alt ? 'img' : undefined}
				/>
			</div>
		</div>
	);
};

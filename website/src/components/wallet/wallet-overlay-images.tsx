import { cn } from '@/lib/utils/cn';
import type { WalletImages } from './wallet.types';

type WalletOverlayImagesProps = {
	images?: WalletImages;
};

export const WalletOverlayImages = ({ images }: WalletOverlayImagesProps) => {
	const primaryImage = images?.primaryImage;
	const hoverEffectImage1 = images?.hoverEffectImage1;

	if (!primaryImage?.src) {
		return null;
	}

	return (
		<div
			className={cn(
				'pointer-events-none absolute z-20 h-[var(--stack-height)]',
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
				{hoverEffectImage1?.src ? (
					<div
						className="absolute inset-0 origin-bottom rounded-sm bg-cover bg-center transition duration-300 ease-out will-change-transform group-hover:translate-x-1 group-hover:-translate-y-4 group-hover:rotate-[5deg] motion-reduce:transform-none motion-reduce:transition-none"
						style={{ backgroundImage: `url(${hoverEffectImage1.src})` }}
						aria-label=""
					/>
				) : null}
				<div
					className="h-full w-full origin-bottom rounded-sm bg-cover bg-center transition duration-300 ease-out will-change-transform group-hover:-translate-x-1 group-hover:-translate-y-7 group-hover:-rotate-5 motion-reduce:transform-none motion-reduce:transition-none"
					style={{ backgroundImage: `url(${primaryImage.src})` }}
					aria-label={primaryImage.alt}
					role={primaryImage.alt ? 'img' : undefined}
				/>
			</div>
		</div>
	);
};

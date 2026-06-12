import { cn } from '@/lib/utils/cn';
import { WALLET_IMAGE_SIZES } from './wallet-image-utils';
import { WalletLayerImage } from './wallet-layer-image';
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
					'relative h-full w-full overflow-visible rounded-sm',
					'[clip-path:inset(calc(-4*var(--shadow-size))_calc(-2*var(--shadow-size))_calc(2*var(--shadow-size))_calc(-2*var(--shadow-size))_round_2px)]',
				)}
			>
				{hoverEffectImage1?.src ? (
					<WalletLayerImage
						image={hoverEffectImage1}
						sizes={WALLET_IMAGE_SIZES}
						decorative
						className="transition duration-300 ease-out will-change-transform group-hover:translate-x-1 group-hover:-translate-y-4 group-hover:rotate-[5deg] motion-reduce:transform-none motion-reduce:transition-none"
					/>
				) : null}
				<WalletLayerImage
					image={primaryImage}
					sizes={WALLET_IMAGE_SIZES}
					decorative
					className="transition duration-300 ease-out will-change-transform group-hover:-translate-x-1 group-hover:-translate-y-7 group-hover:-rotate-5 motion-reduce:transform-none motion-reduce:transition-none"
				/>
			</div>
		</div>
	);
};

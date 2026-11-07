import { cn } from '../../../cn';
import { WALLET_IMAGE_SIZES, WalletLayerImage } from './wallet-layer-image';
import { type WalletImages } from './wallet.types';

type WalletImageStackProps = {
	images?: WalletImages;
};

export const WalletImageStack = ({ images }: WalletImageStackProps) => {
	const primaryImage = images?.primaryImage;
	const hoverEffectImage1 = images?.hoverEffectImage1;
	const hoverEffectImage2 = images?.hoverEffectImage2;
	const hasPrimaryImage = Boolean(primaryImage?.src);

	return (
		<div
			className="-mb-[var(--slant-height)] flex flex-col [background:var(--wallet-back-bg)]"
			data-testid="wallet-image-stack"
		>
			<div
				className={cn(
					'relative h-[var(--stack-height)] rounded-sm',
					hasPrimaryImage ? 'm-[calc(2*var(--shadow-size))]' : 'm-[calc(3*var(--shadow-size))]',
					'mb-0',
					'[box-shadow:var(--wallet-cards-box-shadow)]',
					'[background:var(--wallet-cards-background)]',
				)}
			>
				{hasPrimaryImage && primaryImage ? (
					// Cut off at the top and the pocket like the overlay images, but free at the sides, so both copies line up.
					<div className="absolute inset-0 [clip-path:inset(0_calc(-2*var(--shadow-size))_0_calc(-2*var(--shadow-size)))]">
						{hoverEffectImage2?.src ? (
							<WalletLayerImage image={hoverEffectImage2} sizes={WALLET_IMAGE_SIZES} decorative hoverMotion="back" />
						) : null}
						{hoverEffectImage1?.src ? (
							<WalletLayerImage image={hoverEffectImage1} sizes={WALLET_IMAGE_SIZES} decorative hoverMotion="middle" />
						) : null}
						<WalletLayerImage image={primaryImage} sizes={WALLET_IMAGE_SIZES} hoverMotion="front" />
					</div>
				) : null}
			</div>
		</div>
	);
};

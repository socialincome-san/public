import { cn } from '@/lib/utils/cn';
import { WalletLayerImage } from './wallet-layer-image';
import type { WalletImages } from './wallet.types';

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
					'relative h-[var(--stack-height)] overflow-hidden rounded-sm',
					hasPrimaryImage ? 'm-[calc(2*var(--shadow-size))]' : 'm-[calc(3*var(--shadow-size))]',
					'mb-0',
					'[box-shadow:var(--wallet-cards-box-shadow)]',
					'[background:var(--wallet-cards-background)]',
				)}
			>
				{hasPrimaryImage && primaryImage ? (
					<>
						{hoverEffectImage2?.src ? (
							<WalletLayerImage
								image={hoverEffectImage2}
								sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
								decorative
							/>
						) : null}
						{hoverEffectImage1?.src ? (
							<WalletLayerImage
								image={hoverEffectImage1}
								sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
								decorative
								className="transition duration-300 ease-out will-change-transform group-hover:translate-x-1 group-hover:-translate-y-5 group-hover:rotate-[5deg] motion-reduce:transform-none motion-reduce:transition-none"
							/>
						) : null}
						<WalletLayerImage
							image={primaryImage}
							sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
							className="transition duration-300 ease-out will-change-transform group-hover:-translate-x-1 group-hover:-translate-y-7 group-hover:-rotate-5 motion-reduce:transform-none motion-reduce:transition-none"
						/>
					</>
				) : null}
			</div>
		</div>
	);
};

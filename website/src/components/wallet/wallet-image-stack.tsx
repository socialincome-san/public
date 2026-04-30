import { cn } from '@/lib/utils/cn';
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
		<div className="-mb-(--slant-height) flex flex-col [background:var(--wallet-back-bg)]" data-testid="wallet-image-stack">
			<div
				className={cn(
					'relative h-(--stack-height) overflow-hidden rounded-sm',
					hasPrimaryImage ? 'm-[calc(2*var(--shadow-size))]' : 'm-[calc(3*var(--shadow-size))]',
					'mb-0',
					'[box-shadow:var(--wallet-cards-box-shadow)]',
					'[background:var(--wallet-cards-background)]',
				)}
			>
				{hasPrimaryImage && primaryImage ? (
					<>
						{hoverEffectImage2?.src ? (
							<div
								className="absolute inset-0 origin-bottom rounded-sm bg-cover bg-center"
								style={{ backgroundImage: `url(${hoverEffectImage2.src})` }}
								aria-label=""
							/>
						) : null}
						{hoverEffectImage1?.src ? (
							<div
								className="absolute inset-0 origin-bottom rounded-sm bg-cover bg-center transition duration-300 ease-out will-change-transform group-hover:translate-x-1 group-hover:-translate-y-5 group-hover:rotate-[5deg] motion-reduce:transform-none motion-reduce:transition-none"
								style={{ backgroundImage: `url(${hoverEffectImage1.src})` }}
								aria-label=""
							/>
						) : null}
						<div
							className="absolute inset-0 origin-bottom rounded-sm bg-cover bg-center transition duration-300 ease-out will-change-transform group-hover:-translate-x-1 group-hover:-translate-y-7 group-hover:-rotate-5 motion-reduce:transform-none motion-reduce:transition-none"
							style={{ backgroundImage: `url(${primaryImage.src})` }}
							aria-label={primaryImage.alt}
							role={primaryImage.alt ? 'img' : undefined}
						/>
					</>
				) : null}
			</div>
		</div>
	);
};

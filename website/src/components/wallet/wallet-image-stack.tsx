import { cn } from '@/lib/utils/cn';
import type { WalletImages } from './wallet.types';

type WalletImageStackProps = {
	images?: WalletImages;
};

export const WalletImageStack = ({ images }: WalletImageStackProps) => {
	const main = images?.mainImage;
	const extra1 = images?.extraImage1;
	const extra2 = images?.extraImage2;
	const hasMain = Boolean(main?.src);

	return (
		<div className="-mb-(--slant-height) flex flex-col [background:var(--wallet-back-bg)]" data-testid="wallet-image-stack">
			<div
				className={cn(
					'relative h-(--stack-height) overflow-hidden rounded-sm',
					hasMain ? 'm-[calc(2*var(--shadow-size))]' : 'm-[calc(3*var(--shadow-size))]',
					'mb-0',
					'[box-shadow:var(--wallet-cards-box-shadow)]',
					'[background:var(--wallet-cards-background)]',
				)}
			>
				{hasMain && main ? (
					<>
						{extra2?.src ? (
							<div
								className="absolute inset-0 origin-bottom rounded-sm bg-cover bg-center"
								style={{ backgroundImage: `url(${extra2.src})` }}
								aria-label=""
							/>
						) : null}
						{extra1?.src ? (
							<div
								className="absolute inset-0 origin-bottom rounded-sm bg-cover bg-center transition duration-300 ease-out will-change-transform group-hover:translate-x-1 group-hover:-translate-y-5 group-hover:rotate-[5deg] motion-reduce:transform-none motion-reduce:transition-none"
								style={{ backgroundImage: `url(${extra1.src})` }}
								aria-label=""
							/>
						) : null}
						<div
							className="absolute inset-0 origin-bottom rounded-sm bg-cover bg-center transition duration-300 ease-out will-change-transform group-hover:-translate-x-1 group-hover:-translate-y-7 group-hover:-rotate-5 motion-reduce:transform-none motion-reduce:transition-none"
							style={{ backgroundImage: `url(${main.src})` }}
							aria-label={main.alt}
							role={main.alt ? 'img' : undefined}
						/>
					</>
				) : null}
			</div>
		</div>
	);
};

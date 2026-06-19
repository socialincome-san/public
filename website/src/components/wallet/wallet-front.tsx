import { Button } from '@/components/button';
import { cn } from '@/lib/utils/cn';
import { PlusIcon } from 'lucide-react';
import type { WalletBadge, WalletFooterColumn, WalletVariant } from './wallet.types';

type WalletFrontProps = {
	variant: WalletVariant;
	title: string;
	subtitle?: string | null;
	badge?: WalletBadge;
	footerLeft?: WalletFooterColumn;
	footerRight?: WalletFooterColumn;
};

export const WalletFront = ({ variant, title, subtitle, badge, footerLeft, footerRight }: WalletFrontProps) => (
	<div className="flex aspect-[1.9] flex-1 drop-shadow-[0_4px_20px_rgba(0,0,0,0.09)]" data-testid="wallet-front">
		<WalletFrontContent
			variant={variant}
			title={title}
			subtitle={subtitle}
			badge={badge}
			footerLeft={footerLeft}
			footerRight={footerRight}
		/>
	</div>
);

const WalletFrontContent = ({ variant, title, subtitle, badge, footerLeft, footerRight }: WalletFrontProps) => (
	<div
		className={cn(
			'flex-1 pt-9',
			'text-[color:var(--text-color)]',
			'[background:var(--wallet-front-bg)]',
			'[clip-path:polygon(100%_0%,_100%_100%,_0%_100%,_0%_0%,_var(--slant-shift)_0%,_var(--slant-position)_var(--slant-height),_calc(100%_-_var(--slant-position))_var(--slant-height),_calc(100%_-_var(--slant-shift))_0%)]',
		)}
	>
		<div className="h-full px-7 pt-0 pb-8">
			{variant === 'default' ? (
				<div className="flex h-full w-full flex-col items-start justify-between gap-2">
					<div>
						<h2 className="mb-3 text-4xl leading-none font-normal">{title}</h2>
						<p className="mb-3 line-clamp-1 text-base leading-6 font-medium">{subtitle}</p>
						{badge && <div className="mt-1">{badge}</div>}
					</div>

					{footerLeft || footerRight ? (
						<div className="flex w-full items-start justify-between">
							<div className="flex flex-col items-start">
								{footerLeft ? (
									<>
										<p className="text-base leading-6 font-medium">{footerLeft.label}</p>
										<p className="flex items-baseline text-4xl leading-none font-normal">
											{footerLeft.prefix ? (
												<span className="mr-3 text-base leading-6 font-medium">{footerLeft.prefix}</span>
											) : null}
											<span>{footerLeft.value}</span>
										</p>
									</>
								) : null}
							</div>
							<div className="flex flex-col items-end">
								{footerRight ? (
									<>
										<p className="text-base leading-6 font-medium">{footerRight.label}</p>
										<p className="text-4xl leading-none font-normal tabular-nums">{footerRight.value}</p>
									</>
								) : null}
							</div>
						</div>
					) : null}
				</div>
			) : (
				<div className="flex h-full flex-col items-center justify-center gap-4">
					<Button variant="secondary" size="icon" className="h-12 w-12 rounded-full shadow-xs" aria-label="Add">
						<PlusIcon className="h-6 w-6" />
					</Button>
					<p className="line-clamp-2 min-h-[2.5em] text-center text-2xl leading-[1.25]">{title}</p>
				</div>
			)}
		</div>
	</div>
);

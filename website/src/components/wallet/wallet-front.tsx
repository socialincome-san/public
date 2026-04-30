import { Button } from '@/components/button';
import { cn } from '@/lib/utils/cn';
import { PlusIcon } from 'lucide-react';
import type { WalletBadge, WalletPaidOut, WalletRecipientCount, WalletVariant } from './wallet.types';

const formatAmount = (amount?: number): string => {
	if (amount === null || amount === undefined || isNaN(amount)) {
		return '';
	}

	return new Intl.NumberFormat('de-CH', {
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(amount);
};

type WalletFrontProps = {
	variant: WalletVariant;
	programName: string;
	country?: string | null;
	badge?: WalletBadge;
	paidOut?: WalletPaidOut;
	amountOfRecipients?: WalletRecipientCount;
};

export const WalletFront = ({ variant, programName, country, badge, paidOut, amountOfRecipients }: WalletFrontProps) => (
	<div className="flex aspect-[1.9] flex-1 drop-shadow-[0_4px_20px_rgba(0,0,0,0.09)]" data-testid="wallet-front">
		<div
			className={cn(
				'flex-1 pt-9',
				'text-[color:var(--text-color)]',
				'[background:var(--wallet-front-bg)]',
				'[clip-path:polygon(100%_0%,_100%_100%,_0%_100%,_0%_0%,_var(--slant-shift)_0%,_var(--slant-position)_var(--slant-height),_calc(100%_-_var(--slant-position))_var(--slant-height),_calc(100%_-_var(--slant-shift))_0%)]',
			)}
		>
			<div className="h-full p-8 pt-0 pb-6">
				{variant === 'default' ? (
					<div className="flex h-full w-full flex-col items-start justify-between gap-2">
						<div>
							<h3 className="line-clamp-2 min-h-[2.6em] text-4xl leading-[1.3] font-normal">{programName}</h3>
							<p className="line-clamp-1 min-h-[1.25rem] text-sm leading-5 font-medium tracking-wide">{country}</p>
							{badge && <div className="mt-1">{badge}</div>}
						</div>

						<div className="flex w-full items-start justify-between">
							<div className="flex flex-col items-start">
								<p className="text-sm font-medium tracking-wide">{paidOut?.label}</p>
								<p className="text-4xl font-normal">
									<small className="text-lg">{paidOut?.currency}</small> {formatAmount(paidOut?.amount)}
								</p>
							</div>
							<div className="flex flex-col items-end">
								<p className="text-sm font-medium tracking-wide">{amountOfRecipients?.label}</p>
								<p className="text-4xl font-normal">{amountOfRecipients?.amount}</p>
							</div>
						</div>
					</div>
				) : (
					<div className="flex h-full flex-col items-center justify-center gap-4">
						<Button variant="secondary" size="icon" className="h-12 w-12 rounded-full shadow-xs" aria-label="Add">
							<PlusIcon className="h-6 w-6" />
						</Button>
						<p className="line-clamp-2 min-h-[2.5em] text-center text-2xl leading-[1.25]">{programName}</p>
					</div>
				)}
			</div>
		</div>
	</div>
);

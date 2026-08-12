'use client';

import { Button } from '@/components/button/button';
import { type Currency } from '@/generated/prisma/client';
import { SUBSCRIPTION_CANCEL_RETENTION_PRESETS } from '@/lib/services/subscription/subscription-cancellation';
import { cn } from '@/lib/utils/cn';
import { CircleX } from 'lucide-react';

type Props = {
	currency: Currency;
	labels: {
		heading: string;
		cardTitle: string;
		other: string;
		or: string;
		continueCancel: string;
	};
	onReduceAmount: (value: number | 'other') => void;
	onContinueCancel: () => void;
};

const retentionChipClass =
	'border-border bg-background hover:bg-muted/50 flex h-14 min-w-[5rem] flex-1 cursor-pointer rounded-lg border px-3 py-2 transition-colors';

export const CancelRetentionStep = ({ currency, labels, onReduceAmount, onContinueCancel }: Props) => {
	return (
		<div className="flex flex-col gap-6" data-testid="cancel-retention-step">
			<div className="flex flex-col items-center gap-2 text-center">
				<CircleX className="text-muted-foreground size-8" aria-hidden />
				<p className="text-xl font-medium">{labels.heading}</p>
			</div>

			<div className="bg-muted border-border flex flex-col gap-6 rounded-3xl border px-8 py-7">
				<p className="text-center text-xl font-medium">{labels.cardTitle}</p>

				<div className="flex gap-5">
					{SUBSCRIPTION_CANCEL_RETENTION_PRESETS.map((preset) => (
						<button
							key={preset}
							type="button"
							className={cn(retentionChipClass, 'flex-col items-center justify-center')}
							onClick={() => onReduceAmount(preset)}
							data-testid={`cancel-retention-preset-${preset}`}
						>
							<span className="text-muted-foreground text-[10px] leading-none">{currency}</span>
							<span className="text-lg leading-none font-medium">{preset}</span>
						</button>
					))}
					<button
						type="button"
						className={cn(retentionChipClass, 'items-center justify-center text-sm font-medium')}
						onClick={() => onReduceAmount('other')}
						data-testid="cancel-retention-preset-other"
					>
						{labels.other}
					</button>
				</div>

				<div className="flex items-center gap-3">
					<div className="bg-border h-px flex-1" />
					<span className="text-muted-foreground text-[10px] font-medium uppercase">{labels.or}</span>
					<div className="bg-border h-px flex-1" />
				</div>

				<Button
					type="button"
					variant="outline"
					className="bg-background w-full"
					onClick={onContinueCancel}
					data-testid="cancel-retention-continue"
				>
					{labels.continueCancel}
				</Button>
			</div>
		</div>
	);
};

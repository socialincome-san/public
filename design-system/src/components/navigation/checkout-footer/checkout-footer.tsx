import { type ReactNode } from 'react';
import { cn } from '../../../cn';

type CheckoutFooterSummary = {
	label: string;
	amount: string;
	// Shown muted after the amount, e.g. "per month"
	suffix?: string;
	testId?: string;
};

type CheckoutFooterProps = {
	back?: ReactNode;
	primary: ReactNode;
	summary?: CheckoutFooterSummary;
};

const Amount = ({ amount, suffix }: CheckoutFooterSummary) => (
	<>
		<span className="text-lg leading-none font-medium">{amount}</span>
		{suffix ? <span className="text-muted-foreground shrink-0 text-sm">{suffix}</span> : null}
	</>
);

export const CheckoutFooter = ({ back, primary, summary }: CheckoutFooterProps) => (
	<div className="flex flex-col gap-3">
		{summary ? (
			<div
				className="border-border flex items-center justify-between gap-2 border-y py-2.5 text-sm sm:hidden"
				data-testid={summary.testId ? `${summary.testId}-mobile` : undefined}
			>
				<span className="text-muted-foreground shrink-0">{summary.label}</span>
				<div className="flex min-w-0 items-center gap-1.5">
					<Amount {...summary} />
				</div>
			</div>
		) : null}

		<div className="flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
			{back}
			<div
				className={cn('flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-4', !back && 'sm:ml-auto')}
			>
				{summary ? (
					<div
						className="hidden min-w-0 items-center gap-1.5 text-sm sm:flex"
						data-testid={summary.testId}
						aria-live="polite"
					>
						<span>{summary.label}</span>
						<Amount {...summary} />
					</div>
				) : null}
				{primary}
			</div>
		</div>
	</div>
);

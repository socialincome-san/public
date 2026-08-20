'use client';

import { Button } from '@/components/button/button';
import { CoverTransactionCostsToggle } from '@/components/donation-wizard/steps/step-payment/cover-transaction-costs-toggle';
import { formatDonationCurrencyAmount } from '@/components/donation-wizard/utils/donation-formatting';
import { Input } from '@/components/input/input';
import { Separator } from '@/components/separator';
import { Slider } from '@/components/slider';
import { type Currency } from '@/generated/prisma/client';
import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import {
	getAmountWithTransactionCostCoverage,
	getOnlineTransactionCost,
} from '@/lib/services/subscription/cover-transaction-costs';
import {
	canUpdateSubscriptionAmount,
	clampSubscriptionAmount,
	isSubscriptionAmountInRange,
	parseSubscriptionAmountInput,
	SUBSCRIPTION_AMOUNT_MAX,
	SUBSCRIPTION_AMOUNT_MIN,
	SUBSCRIPTION_AMOUNT_SLIDER_MAX,
} from '@/lib/services/subscription/subscription-amount';
import { CircleX, CreditCard } from 'lucide-react';
import { type ReactNode, useState } from 'react';

type Props = {
	amount: number;
	initialAmount: number;
	currency: Currency;
	brand?: string;
	last4?: string;
	coverTransactionCosts?: boolean;
	initialCoverTransactionCosts?: boolean;
	showCoverTransactionCosts?: boolean;
	error?: string;
	isSubmitting: boolean;
	isUpdatingCard?: boolean;
	labels: {
		monthlyContribution: string;
		transactionFees: string;
		paymentMethod: string;
		perMonthSuffix: string;
		updateCard: string;
		cancelSubscription: string;
		cancel: string;
		updateSubscription: string;
		updatingSubscription: string;
		cardFallback: string;
	};
	onAmountChange: (amount: number) => void;
	onCoverTransactionCostsChange?: (checked: boolean) => void;
	onCancel: () => void;
	onStartCancel?: () => void;
	onSubmit: () => void;
	onUpdateCard?: () => void;
	cardUpdateConfirm?: {
		message: string;
		stayLabel: string;
		leaveLabel: string;
		onStay: () => void;
		onLeave: () => void;
	};
};

const EditSection = ({ title, children }: { title: string; children: ReactNode }) => (
	<section className="flex flex-col gap-2.5 sm:gap-3">
		<h3 className="text-sm font-medium sm:text-base">{title}</h3>
		{children}
	</section>
);

export const EditSubscriptionStep = ({
	amount,
	initialAmount,
	currency,
	brand,
	last4,
	coverTransactionCosts = false,
	initialCoverTransactionCosts = false,
	showCoverTransactionCosts = false,
	error,
	isSubmitting,
	isUpdatingCard = false,
	labels,
	onAmountChange,
	onCoverTransactionCostsChange,
	onCancel,
	onStartCancel,
	onSubmit,
	onUpdateCard,
	cardUpdateConfirm,
}: Props) => {
	const { t: tWizard } = useRouteTranslator({ namespace: 'donation-wizard' });
	const cardLabel = brand && last4 ? `${brand} •••• ${last4}` : labels.cardFallback;
	const amountChanged = canUpdateSubscriptionAmount(amount, initialAmount);
	const coverChanged = coverTransactionCosts !== initialCoverTransactionCosts;
	const canSubmit =
		isSubscriptionAmountInRange(amount) && (amountChanged || coverChanged) && !isSubmitting && !isUpdatingCard;
	const sliderMax = Math.min(SUBSCRIPTION_AMOUNT_MAX, Math.max(SUBSCRIPTION_AMOUNT_SLIDER_MAX, initialAmount));
	const [amountDraft, setAmountDraft] = useState<string | null>(null);
	const amountInput = amountDraft ?? String(amount);
	const transactionCost = getOnlineTransactionCost(amount);
	const totalAmount = coverTransactionCosts ? getAmountWithTransactionCostCoverage(amount) : amount;
	const showPaymentMethod = Boolean(onUpdateCard);
	const showFees = Boolean(showCoverTransactionCosts && onCoverTransactionCostsChange);

	const totalSummary = (
		<>
			<span className="text-lg leading-none font-medium">{formatDonationCurrencyAmount(currency, totalAmount)}</span>
			<span className="text-muted-foreground shrink-0 text-sm">{tWizard('stepPlan.per-month')}</span>
		</>
	);

	return (
		<div className="flex flex-col gap-4 sm:gap-6" data-testid="edit-subscription-step">
			<div className="flex flex-col gap-4 sm:gap-6">
				<EditSection title={labels.monthlyContribution}>
					<div className="border-border flex items-center gap-2 rounded-xl border px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
						<span className="text-muted-foreground text-sm">{currency}</span>
						<Input
							type="number"
							inputMode="numeric"
							min={SUBSCRIPTION_AMOUNT_MIN}
							max={SUBSCRIPTION_AMOUNT_MAX}
							value={amountInput}
							onChange={(event) => {
								const nextValue = event.target.value;
								setAmountDraft(nextValue);
								const parsed = parseSubscriptionAmountInput(nextValue);
								if (parsed !== null) {
									onAmountChange(parsed);
								}
							}}
							onBlur={() => setAmountDraft(null)}
							className="h-auto flex-1 rounded-none border-0 bg-transparent px-0 text-center text-2xl font-medium shadow-none focus-visible:ring-0 sm:text-3xl"
							aria-label={labels.monthlyContribution}
							data-testid="edit-subscription-amount-input"
						/>
						<span className="text-muted-foreground text-xs whitespace-nowrap sm:text-sm">{labels.perMonthSuffix}</span>
					</div>
					<div className="flex flex-col gap-2">
						<Slider
							min={SUBSCRIPTION_AMOUNT_MIN}
							max={sliderMax}
							step={1}
							value={[amount]}
							onValueChange={([value]) => {
								setAmountDraft(null);
								onAmountChange(clampSubscriptionAmount(value ?? amount));
							}}
							aria-label={labels.monthlyContribution}
							data-testid="edit-subscription-amount-slider"
						/>
						<div className="text-muted-foreground flex justify-between text-xs">
							<span>
								{currency} {SUBSCRIPTION_AMOUNT_MIN}
							</span>
							<span>
								{currency} {sliderMax}
							</span>
						</div>
					</div>
				</EditSection>

				{showFees && onCoverTransactionCostsChange ? (
					<>
						<Separator />
						<EditSection title={labels.transactionFees}>
							<CoverTransactionCostsToggle
								cadence="monthly"
								currency={currency}
								transactionCost={transactionCost}
								checked={coverTransactionCosts}
								disabled={isSubmitting || isUpdatingCard}
								switchId="edit-subscription-cover-transaction-costs"
								layout="stacked"
								tone={coverTransactionCosts ? 'accent' : 'warning'}
								onCheckedChange={onCoverTransactionCostsChange}
							/>
						</EditSection>
					</>
				) : null}

				{showPaymentMethod ? (
					<>
						<Separator />
						<EditSection title={labels.paymentMethod}>
							<div className="bg-muted flex flex-col gap-3 rounded-xl px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
								<span className="text-muted-foreground flex min-w-0 items-center gap-2 text-sm">
									<CreditCard className="size-4 shrink-0" aria-hidden />
									<span className="truncate">{cardLabel}</span>
								</span>
								{!cardUpdateConfirm ? (
									<Button
										type="button"
										variant="outline"
										size="sm"
										className="bg-background w-full shrink-0 sm:w-auto"
										disabled={isSubmitting || isUpdatingCard}
										onClick={onUpdateCard}
									>
										{labels.updateCard}
									</Button>
								) : null}
							</div>
							{cardUpdateConfirm ? (
								<div className="flex flex-col gap-3">
									<p className="text-muted-foreground text-sm" role="status">
										{cardUpdateConfirm.message}
									</p>
									<div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
										<Button
											type="button"
											variant="outline"
											size="sm"
											className="w-full sm:w-auto"
											disabled={isSubmitting || isUpdatingCard}
											onClick={cardUpdateConfirm.onStay}
										>
											{cardUpdateConfirm.stayLabel}
										</Button>
										<Button
											type="button"
											size="sm"
											className="w-full sm:w-auto"
											disabled={isSubmitting || isUpdatingCard}
											onClick={cardUpdateConfirm.onLeave}
										>
											{cardUpdateConfirm.leaveLabel}
										</Button>
									</div>
								</div>
							) : null}
						</EditSection>
					</>
				) : null}

				<button
					type="button"
					className="text-muted-foreground hover:text-primary inline-flex items-center gap-2 self-start text-sm disabled:opacity-50"
					disabled={isSubmitting || isUpdatingCard || !onStartCancel}
					onClick={onStartCancel}
					data-testid="edit-subscription-start-cancel"
				>
					<CircleX className="size-4 shrink-0" aria-hidden />
					{labels.cancelSubscription}
				</button>

				{error ? (
					<p className="text-destructive text-sm" role="alert">
						{error}
					</p>
				) : null}
			</div>

			<div className="bg-background sticky bottom-0 z-10 -mx-6 mt-2 border-t px-6 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:static sm:mx-0 sm:mt-0 sm:border-0 sm:bg-transparent sm:px-0 sm:pt-2 sm:pb-0">
				{showFees ? (
					<div
						className="border-border mb-3 flex items-center justify-between gap-2 border-y py-2.5 text-sm sm:hidden"
						data-testid="edit-subscription-total-mobile"
					>
						<span className="text-muted-foreground shrink-0">{tWizard('stepPayment.your-donation')}</span>
						<div className="flex min-w-0 items-center gap-1.5">{totalSummary}</div>
					</div>
				) : null}

				<div className="flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
					<Button
						type="button"
						variant="outline"
						className="w-full sm:w-auto"
						onClick={onCancel}
						disabled={isSubmitting || isUpdatingCard}
					>
						{labels.cancel}
					</Button>

					<div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
						{showFees ? (
							<div
								className="hidden min-w-0 items-center gap-1.5 text-sm sm:flex"
								data-testid="edit-subscription-total"
								aria-live="polite"
							>
								<span>{tWizard('stepPayment.your-donation')}</span>
								{totalSummary}
							</div>
						) : null}
						<Button
							type="button"
							className="w-full sm:w-auto"
							onClick={onSubmit}
							disabled={!canSubmit}
							aria-busy={isSubmitting}
						>
							{isSubmitting ? labels.updatingSubscription : labels.updateSubscription}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

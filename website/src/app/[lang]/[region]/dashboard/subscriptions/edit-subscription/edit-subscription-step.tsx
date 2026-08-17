'use client';

import { Button } from '@/components/button/button';
import { Input } from '@/components/input/input';
import { Slider } from '@/components/slider';
import { type Currency } from '@/generated/prisma/client';
import {
	canUpdateSubscriptionAmount,
	clampSubscriptionAmount,
	parseSubscriptionAmountInput,
	SUBSCRIPTION_AMOUNT_MAX,
	SUBSCRIPTION_AMOUNT_MIN,
	SUBSCRIPTION_AMOUNT_SLIDER_MAX,
} from '@/lib/services/subscription/subscription-amount';
import { CircleX, CreditCard } from 'lucide-react';
import { useState } from 'react';

type Props = {
	amount: number;
	initialAmount: number;
	currency: Currency;
	brand?: string;
	last4?: string;
	error?: string;
	isSubmitting: boolean;
	isUpdatingCard?: boolean;
	labels: {
		monthlyContribution: string;
		perMonthSuffix: string;
		updateCard: string;
		cancelSubscription: string;
		cancel: string;
		updateSubscription: string;
		updatingSubscription: string;
		cardFallback: string;
	};
	onAmountChange: (amount: number) => void;
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

export const EditSubscriptionStep = ({
	amount,
	initialAmount,
	currency,
	brand,
	last4,
	error,
	isSubmitting,
	isUpdatingCard = false,
	labels,
	onAmountChange,
	onCancel,
	onStartCancel,
	onSubmit,
	onUpdateCard,
	cardUpdateConfirm,
}: Props) => {
	const cardLabel = brand && last4 ? `${brand} •••• ${last4}` : labels.cardFallback;
	const canSubmit = canUpdateSubscriptionAmount(amount, initialAmount) && !isSubmitting && !isUpdatingCard;
	const sliderMax = Math.min(SUBSCRIPTION_AMOUNT_MAX, Math.max(SUBSCRIPTION_AMOUNT_SLIDER_MAX, initialAmount));
	const [amountDraft, setAmountDraft] = useState<string | null>(null);
	const amountInput = amountDraft ?? String(amount);

	return (
		<div className="flex flex-col gap-6" data-testid="edit-subscription-step">
			<div className="flex flex-col gap-4">
				<p className="text-base font-medium">{labels.monthlyContribution}</p>
				<div className="border-border flex items-center gap-3 rounded-xl border px-4 py-3">
					<span className="text-muted-foreground text-sm">{currency}</span>
					<Input
						type="number"
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
						className="h-auto flex-1 rounded-none border-0 bg-transparent px-0 text-center text-3xl font-medium shadow-none focus-visible:ring-0"
						aria-label={labels.monthlyContribution}
						data-testid="edit-subscription-amount-input"
					/>
					<span className="text-muted-foreground text-sm whitespace-nowrap">{labels.perMonthSuffix}</span>
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
			</div>

			{onUpdateCard && (
				<div className="flex flex-col gap-3">
					<div className="bg-muted flex items-center justify-between gap-4 rounded-xl px-4 py-3">
						<span className="text-muted-foreground flex items-center gap-2 text-sm">
							<CreditCard className="size-4 shrink-0" aria-hidden />
							{cardLabel}
						</span>
						{!cardUpdateConfirm && (
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="bg-background"
								disabled={isSubmitting || isUpdatingCard}
								onClick={onUpdateCard}
							>
								{labels.updateCard}
							</Button>
						)}
					</div>
					{cardUpdateConfirm && (
						<div className="flex flex-col gap-3">
							<p className="text-muted-foreground text-sm" role="status">
								{cardUpdateConfirm.message}
							</p>
							<div className="flex flex-wrap gap-2">
								<Button
									type="button"
									variant="outline"
									size="sm"
									disabled={isSubmitting || isUpdatingCard}
									onClick={cardUpdateConfirm.onStay}
								>
									{cardUpdateConfirm.stayLabel}
								</Button>
								<Button
									type="button"
									size="sm"
									disabled={isSubmitting || isUpdatingCard}
									onClick={cardUpdateConfirm.onLeave}
								>
									{cardUpdateConfirm.leaveLabel}
								</Button>
							</div>
						</div>
					)}
				</div>
			)}

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

			{error && (
				<p className="text-destructive text-sm" role="alert">
					{error}
				</p>
			)}

			<div className="flex items-center justify-between gap-4 pt-2">
				<Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting || isUpdatingCard}>
					{labels.cancel}
				</Button>
				<Button type="button" onClick={onSubmit} disabled={!canSubmit} aria-busy={isSubmitting}>
					{isSubmitting ? labels.updatingSubscription : labels.updateSubscription}
				</Button>
			</div>
		</div>
	);
};

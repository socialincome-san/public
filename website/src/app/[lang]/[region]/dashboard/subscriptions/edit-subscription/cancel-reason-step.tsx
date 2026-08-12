'use client';

import { Button } from '@/components/button/button';
import { Label } from '@/components/label';
import { RadioGroup, RadioGroupItem } from '@/components/radio-group';
import { type SubscriptionCancellationReason } from '@/generated/prisma/enums';
import {
	SUBSCRIPTION_CANCEL_REASONS,
	isSubscriptionCancellationReason,
} from '@/lib/services/subscription/subscription-cancellation';

type Props = {
	selectedReason?: SubscriptionCancellationReason;
	reasonLabels: Record<SubscriptionCancellationReason, string>;
	labels: {
		heading: string;
		confirm: string;
	};
	error?: string;
	isSubmitting: boolean;
	onSelectReason: (reason: SubscriptionCancellationReason) => void;
	onConfirm: () => void;
};

export const CancelReasonStep = ({
	selectedReason,
	reasonLabels,
	labels,
	error,
	isSubmitting,
	onSelectReason,
	onConfirm,
}: Props) => {
	return (
		<div className="flex flex-col gap-6" data-testid="cancel-reason-step">
			<p className="text-base font-medium">{labels.heading}</p>

			<RadioGroup
				value={selectedReason}
				onValueChange={(value) => {
					if (isSubscriptionCancellationReason(value)) {
						onSelectReason(value);
					}
				}}
				className="gap-4"
				aria-label={labels.heading}
			>
				{SUBSCRIPTION_CANCEL_REASONS.map((reason) => (
					<Label key={reason} htmlFor={`cancel-reason-${reason}`} className="flex cursor-pointer items-center gap-3">
						<RadioGroupItem id={`cancel-reason-${reason}`} value={reason} data-testid={`cancel-reason-${reason}`} />
						<span className="text-sm">{reasonLabels[reason]}</span>
					</Label>
				))}
			</RadioGroup>

			{error && (
				<p className="text-destructive text-sm" role="alert">
					{error}
				</p>
			)}

			<Button
				type="button"
				variant="destructive"
				className="w-full"
				disabled={!selectedReason || isSubmitting}
				onClick={onConfirm}
				data-testid="cancel-reason-confirm"
			>
				{labels.confirm}
			</Button>
		</div>
	);
};

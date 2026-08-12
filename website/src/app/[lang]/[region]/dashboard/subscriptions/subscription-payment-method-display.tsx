import { type ActiveSubscriptionView } from '@/lib/services/subscription/subscription.types';
import { CreditCard, QrCode } from 'lucide-react';

type PaymentDisplay = ActiveSubscriptionView['paymentDisplay'];

type Props = {
	paymentDisplay: PaymentDisplay;
	labels: {
		wireTransfer: string;
		cardFallback: string;
	};
};

export const SubscriptionPaymentMethodDisplay = ({ paymentDisplay, labels }: Props) => {
	if (paymentDisplay.type === 'bank_transfer') {
		return (
			<span className="text-muted-foreground flex items-center gap-2 text-sm">
				<QrCode className="size-4 shrink-0" aria-hidden />
				{labels.wireTransfer}
			</span>
		);
	}

	const { brand, last4 } = paymentDisplay;
	const label = brand && last4 ? `${brand} •••• ${last4}` : labels.cardFallback;

	return (
		<span className="text-muted-foreground flex items-center gap-2 text-sm">
			<CreditCard className="size-4 shrink-0" aria-hidden />
			{label}
		</span>
	);
};

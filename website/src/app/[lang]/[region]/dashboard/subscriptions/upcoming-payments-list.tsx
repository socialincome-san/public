import { Badge } from '@/components/badge/badge';
import { type WebsiteLanguage } from '@/lib/i18n/utils';
import { type UpcomingPaymentView } from '@/lib/services/subscription/subscription.types';
import { formatCurrencyLocale, formatUtcDate, fractionalCurrencyFormatOptions } from '@/lib/utils/string-utils';
import { CalendarIcon } from 'lucide-react';
import { SubscriptionPaymentMethodDisplay } from './subscription-payment-method-display';

type Props = {
	lang: WebsiteLanguage;
	payments: UpcomingPaymentView[];
	labels: {
		upcomingPayments: string;
		scheduled: string;
		wireTransfer: string;
		cardFallback: string;
	};
};

export const UpcomingPaymentsList = ({ lang, payments, labels }: Props) => {
	return (
		<div className="flex flex-col gap-4 pt-6" data-testid="upcoming-payments">
			<h2 className="text-base font-medium">{labels.upcomingPayments}</h2>
			<div className="flex flex-col gap-2">
				{payments.map((payment) => (
					<div
						key={`${payment.subscriptionId}-${payment.scheduledAt.toISOString()}`}
						className="border-border flex items-center justify-between gap-4 rounded-xl border px-4 py-3"
						data-testid="upcoming-payment-row"
					>
						<div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1">
							<span className="flex items-center gap-2 text-sm font-medium">
								<CalendarIcon className="size-4 shrink-0" aria-hidden />
								{formatUtcDate(payment.scheduledAt)}
							</span>
							<SubscriptionPaymentMethodDisplay paymentDisplay={payment.paymentDisplay} labels={labels} />
						</div>
						<div className="flex shrink-0 items-center gap-4">
							<span className="text-sm font-medium">
								{formatCurrencyLocale(payment.amount, payment.currency, lang, fractionalCurrencyFormatOptions)}
							</span>
							<Badge variant="verified">{labels.scheduled}</Badge>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

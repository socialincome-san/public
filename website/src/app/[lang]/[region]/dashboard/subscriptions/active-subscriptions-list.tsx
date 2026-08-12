import { type WebsiteLanguage } from '@/lib/i18n/utils';
import { type ActiveSubscriptionView } from '@/lib/services/subscription/subscription.types';
import { formatCurrencyLocale, formatDateLocale, wholeCurrencyFormatOptions } from '@/lib/utils/string-utils';
import { SubscriptionPaymentMethodDisplay } from './subscription-payment-method-display';

type Props = {
	lang: WebsiteLanguage;
	subscriptions: ActiveSubscriptionView[];
	labels: {
		activeSubscriptions: string;
		perMonth: string;
		since: string;
		wireTransfer: string;
		cardFallback: string;
	};
};

export const ActiveSubscriptionsList = ({ lang, subscriptions, labels }: Props) => {
	return (
		<div className="flex flex-col gap-4 pt-6">
			<h2 className="text-base font-medium">{labels.activeSubscriptions}</h2>
			<div className="flex flex-col gap-4">
				{subscriptions.map((subscription) => (
					<div
						key={subscription.id}
						className="border-border flex flex-col gap-4 rounded-xl border p-6 sm:flex-row sm:items-center sm:justify-between"
					>
						<p className="text-base">
							<span className="font-semibold">
								{formatCurrencyLocale(subscription.amount, subscription.currency, lang, wholeCurrencyFormatOptions)}
							</span>{' '}
							<span className="text-muted-foreground">
								{labels.perMonth} · {labels.since} {formatDateLocale(subscription.createdAt, lang)}
							</span>
						</p>
						<SubscriptionPaymentMethodDisplay paymentDisplay={subscription.paymentDisplay} labels={labels} />
					</div>
				))}
			</div>
		</div>
	);
};

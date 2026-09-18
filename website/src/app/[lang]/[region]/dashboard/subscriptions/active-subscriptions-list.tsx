import { type WebsiteLanguage } from '@/lib/i18n/utils';
import { type ActiveSubscriptionView } from '@/lib/services/subscription/subscription.types';
import { EditSubscriptionRow } from './edit-subscription/edit-subscription-row';
import { WireSubscriptionRow } from './wire-subscription-row';

type Props = {
	lang: WebsiteLanguage;
	subscriptions: ActiveSubscriptionView[];
	labels: {
		activeSubscriptions: string;
		perMonth: string;
		since: string;
		wireTransfer: string;
		cardFallback: string;
		edit: string;
		viewQr: string;
		qrDialogTitle: string;
		qrUnavailable: string;
		close: string;
	};
};

export const ActiveSubscriptionsList = ({ lang, subscriptions, labels }: Props) => {
	return (
		<div className="flex flex-col gap-4 pt-6">
			<h2 className="text-base font-medium">{labels.activeSubscriptions}</h2>
			<div className="flex flex-col gap-4">
				{subscriptions.map((subscription) => {
					if (subscription.paymentDisplay.type === 'stripe') {
						return (
							<EditSubscriptionRow
								key={subscription.id}
								lang={lang}
								labels={labels}
								subscription={{
									subscriptionId: subscription.id,
									amount: subscription.amount,
									currency: subscription.currency,
									paymentMethod: 'stripe',
									createdAt: subscription.createdAt,
									coverTransactionCosts: subscription.coverTransactionCosts,
									brand: subscription.paymentDisplay.brand,
									last4: subscription.paymentDisplay.last4,
								}}
							/>
						);
					}

					return (
						<WireSubscriptionRow
							key={subscription.id}
							lang={lang}
							labels={labels}
							subscription={{
								id: subscription.id,
								amount: subscription.amount,
								currency: subscription.currency,
								createdAt: subscription.createdAt,
								paymentDisplay: subscription.paymentDisplay,
							}}
						/>
					);
				})}
			</div>
		</div>
	);
};

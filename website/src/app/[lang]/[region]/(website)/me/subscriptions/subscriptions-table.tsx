'use client';

import { DefaultParams } from '@/app/[lang]/[region]';
import { useTranslator } from '@/hooks/useTranslator';
import { toDateTime } from '@socialincome/shared/src/utils/date';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Typography } from '@socialincome/ui';
import { useQuery } from '@tanstack/react-query';
import { useUser } from 'reactfire';
import Stripe from 'stripe';

type SubscriptionsTableProps = {
	translations: {
		from: string;
		until: string;
		status: string;
		interval: string;
		amount: string;
	};
} & DefaultParams;

export function SubscriptionsTable({ lang, translations }: SubscriptionsTableProps) {
	const translator = useTranslator(lang, 'website-me');
	const { data: authUser } = useUser();
	const { data: subscriptions } = useQuery({
		queryKey: ['SubscriptionsTable', authUser?.uid],
		queryFn: async () => {
			const firebaseAuthToken = await authUser?.getIdToken(true);
			const response = await fetch(`/api/stripe/subscriptions?firebaseAuthToken=${firebaseAuthToken}`);
			return (await response.json()) as Stripe.Subscription[];
		},
		staleTime: 1000 * 60 * 60, // 1 hour
	});

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>{translations.from}</TableHead>
					<TableHead>{translations.until}</TableHead>
					<TableHead>{translations.status}</TableHead>
					<TableHead>{translations.interval}</TableHead>
					<TableHead className="text-right">{translations.amount}</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{subscriptions?.map((subscription, index) => {
					return (
						<TableRow key={index}>
							<TableCell>
								<Typography>{toDateTime(subscription.start_date * 1000).toFormat('DD', { locale: lang })}</Typography>
							</TableCell>
							<TableCell>
								<Typography>
									{subscription.ended_at && toDateTime(subscription.ended_at * 1000).toFormat('DD', { locale: lang })}
								</Typography>
							</TableCell>
							<TableCell>
								<Typography>{translator?.t(`subscriptions.status.${subscription.status}`)}</Typography>
							</TableCell>
							<TableCell>
								<Typography>
									{translator?.t(`subscriptions.interval-${subscription.items.data[0].plan.interval_count}`)}
								</Typography>
							</TableCell>
							<TableCell className="text-right">
								<Typography>
									{translator?.t('subscriptions.amount-currency', {
										context: {
											amount: (subscription.items.data[0].plan.amount || 0) / 100,
											currency: subscription.items.data[0].plan.currency,
											locale: lang,
										},
									})}
								</Typography>
							</TableCell>
						</TableRow>
					);
				})}
			</TableBody>
		</Table>
	);
}

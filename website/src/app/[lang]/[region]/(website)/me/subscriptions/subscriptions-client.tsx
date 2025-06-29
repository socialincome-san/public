'use client';

import { DefaultParams } from '@/app/[lang]/[region]';
import { useSubscriptions } from '@/app/[lang]/[region]/(website)/me/hooks';
import { BillingPortalButton } from '@/app/[lang]/[region]/(website)/me/subscriptions/billing-portal-button';
import { useTranslator } from '@/lib/hooks/useTranslator';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import { toDateTime } from '@socialincome/shared/src/utils/date';
import {
	Button,
	linkCn,
	SpinnerIcon,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
	Typography,
} from '@socialincome/ui';
import Link from 'next/link';

type SubscriptionsTableProps = {
	translations: {
		from: string;
		until: string;
		status: string;
		interval: string;
		amount: string;
		newSubscription: string;
		manageSubscriptions: string;
	};
} & DefaultParams;

export function SubscriptionsClient({ lang, region, translations }: SubscriptionsTableProps) {
	const translator = useTranslator(lang, 'website-me');
	const { subscriptions, isLoading } = useSubscriptions();

	if (isLoading) {
		return <SpinnerIcon />;
	}

	return (
		<div className="flex flex-col">
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
			<div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
				<Link className={linkCn()} href={`/${lang}/${region}/donate/individual`}>
					<Button Icon={PlusCircleIcon} variant="ghost" size="lg" className="w-full">
						{translations.newSubscription}
					</Button>
				</Link>
				<BillingPortalButton
					translations={{
						manageSubscriptions: translations.manageSubscriptions,
					}}
				/>
			</div>
		</div>
	);
}

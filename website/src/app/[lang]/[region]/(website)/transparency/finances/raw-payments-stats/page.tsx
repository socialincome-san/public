import { TransparencyPageProps } from '@/app/[lang]/[region]/(website)/transparency/finances/[currency]/page';
import { firestoreAdmin } from '@/firebase-admin';
import { PaymentStatsCalculator } from '@socialincome/shared/src/utils/stats/PaymentStatsCalculator';
import { BaseContainer, Card, Typography } from '@socialincome/ui';

export default async function Page({ params }: TransparencyPageProps) {
	const paymentCalculator = await PaymentStatsCalculator.build(firestoreAdmin, 'CHF');
	const paymentStats = paymentCalculator.allStats();

	return (
		<BaseContainer className="flex flex-col space-y-2 py-8">
			<Typography size="xl" weight="bold">
				Total payments amount: {paymentStats.totalPaymentsAmount.toFixed(2)}
			</Typography>
			<Typography size="xl" weight="bold">
				Total payments count: {paymentStats.totalPaymentsCount}
			</Typography>
			<Typography size="xl" weight="bold">
				Payments by month
			</Typography>
			<div className="mt-4 grid grid-cols-3 gap-4">
				{paymentStats.totalPaymentsByMonth.map((payment) => (
					<Card className="p-4">
						<Typography size="lg" weight="semibold">
							{payment.month}
						</Typography>
						<Typography>SLE: {payment.amountSLE}</Typography>
						<Typography>CHF: {Number(payment.amount).toFixed(2)}</Typography>
						<Typography>Exchange Rate: {(Number(payment.amount) / Number(payment.amountSLE)).toFixed(6)}</Typography>
						<Typography>Number of recipients: {payment.recipientsCount}</Typography>
					</Card>
				))}
			</div>
		</BaseContainer>
	);
}

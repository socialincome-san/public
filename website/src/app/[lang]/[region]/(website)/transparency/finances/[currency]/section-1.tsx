import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Card, CardContent, Typography } from '@socialincome/ui';
import _ from 'lodash';
import { SectionProps } from './page';

export const roundAmount = (amount: number) => (amount ? Math.round(amount / 10) * 10 : 0);

export async function Section1({ params, paymentStats, contributionStats }: SectionProps) {
	const translator = await Translator.getInstance({ language: params.lang, namespaces: ['website-finances'] });

	const cards = [
		translator.t('section-1.totalPayments', {
			context: { value: paymentStats.totalPaymentsCount },
		}),
		translator.t('section-1.totalRecipients', {
			context: {
				value: _.last(paymentStats.cumulativeRecipientsByMonth)?.recipients,
			},
		}),
		translator.t('section-1.totalContributions', {
			context: {
				contributorCount: contributionStats.totalContributorsCount,
				value: roundAmount(contributionStats.totalContributionsAmount),
				currency: params.currency,
				maximumFractionDigits: 0,
			},
		}),
	];

	return (
		<div>
			<div className="mb-8">
				<Typography weight="bold" size="4xl">
					{translator.t('section-1.title-1')}
				</Typography>
				<Typography weight="bold" size="4xl" color="secondary">
					{translator.t('section-1.title-2')}
				</Typography>
			</div>
			<div className="flex flex-col space-y-2">
				<Typography color="muted-foreground">{translator.t('section-1.since-march-2020')}</Typography>
				{cards.map((card, index) => (
					<Card key={index} className="duration-100 hover:scale-[101%]">
						<CardContent className="py-8">
							<Typography size="xl" weight="normal">
								{card}
							</Typography>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}

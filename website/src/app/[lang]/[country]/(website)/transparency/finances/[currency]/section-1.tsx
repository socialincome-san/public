import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Typography } from '@socialincome/ui';
import _ from 'lodash';
import { SectionProps } from './page';

export async function Section1({ params, paymentStats, contributionStats }: SectionProps) {
	const translator = await Translator.getInstance({ language: params.lang, namespaces: ['website-transparency'] });

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
				value: contributionStats.totalContributionsAmount,
				currency: params.currency,
			},
		}),
	];

	return (
		<div className="flex flex-col justify-center space-y-2">
			<div className="my-8">
				<Typography weight="bold" size="4xl" lineHeight="tight">
					{translator.t('section-1.title-1')}
				</Typography>
				<Typography weight="bold" size="4xl" lineHeight="tight">
					{translator.t('section-1.title-2')}
				</Typography>
			</div>
			<Typography color="muted-foreground">{translator.t('section-1.since-march-2020')}</Typography>
			{cards.map((card, index) => (
				<div key={index} className="border-neutral rounded-lg border px-4 py-6 duration-200 hover:scale-[102%]">
					<Typography size="xl" weight="normal">
						{card}
					</Typography>
				</div>
			))}
		</div>
	);
}

import { RecipientProgramStatus } from '@socialincome/shared/src/types/recipient';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Badge, Card, CardContent, Typography } from '@socialincome/ui';
import { Section1Props } from './page';

export const roundAmount = (amount: number) => {
	if (amount === 0) return 0;
	const rounded = Math.round(amount / 10) * 10;
	return rounded === 0 ? 10 : rounded;
};

export async function Section1({ params, paymentStats, contributionStats, recipientStats }: Section1Props) {
	const translator = await Translator.getInstance({ language: params.lang, namespaces: ['website-finances'] });

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
				<Card className="duration-100 hover:scale-[101%]">
					<CardContent className="py-8">
						<Typography size="xl" weight="normal">
							{translator.t('section-1.totalPayments', {
								context: { value: paymentStats.totalPaymentsCount },
							})}
						</Typography>
					</CardContent>
				</Card>
				<Card className="duration-100 hover:scale-[101%]">
					<CardContent className="flex flex-col items-start space-y-2 py-8 sm:flex-row sm:justify-between sm:space-y-0">
						<Typography size="xl" weight="normal">
							{translator.t('section-1.totalRecipients', {
								context: {
									value:
										(recipientStats.recipientsCountByStatus['total'] ?? 0) -
										(recipientStats.recipientsCountByStatus[RecipientProgramStatus.Waitlisted] ?? 0),
								},
							})}
						</Typography>
						<Badge variant="interactive-accent">
							{translator.t('section-1.activeRecipients', {
								context: {
									value: recipientStats.recipientsCountByStatus[RecipientProgramStatus.Active] ?? 0,
								},
							})}
						</Badge>
					</CardContent>
				</Card>
				<Card className="duration-100 hover:scale-[101%]">
					<CardContent className="py-8">
						<Typography size="xl" weight="normal">
							{translator.t('section-1.totalContributions', {
								context: {
									contributorCount: contributionStats.totalContributorsCount,
									value: roundAmount(contributionStats.totalContributionsAmount),
									currency: params.currency,
									maximumFractionDigits: 0,
								},
							})}
						</Typography>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

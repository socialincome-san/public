import { Card } from '@/components/card';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { TransparencyTotals } from '@/lib/services/transparency/transparency.types';

type TotalsSectionProps = {
	totals: TransparencyTotals;
	lang: WebsiteLanguage;
};

const formatChf = (value: number) => {
	const number = new Intl.NumberFormat('de-CH', { maximumFractionDigits: 0 }).format(value);

	return `CHF ${number}`;
};

const formatNumber = (value: number, lang: WebsiteLanguage): string => {
	return new Intl.NumberFormat(lang).format(value);
};

export const TotalsSection = ({ totals, lang }: TotalsSectionProps) => {
	const totalContributions = totals.totalContributionsChf;

	return (
		<section>
			<h2 className="mb-6 text-2xl font-semibold">Overview</h2>
			<div className="grid gap-6 md:grid-cols-3">
				<Card>
					<div className="space-y-2">
						<p className="text-muted-foreground text-sm">Total Contributions</p>
						<p className="text-3xl font-bold">{formatChf(totalContributions)}</p>
					</div>
				</Card>
				<Card>
					<div className="space-y-2">
						<p className="text-muted-foreground text-sm">Total Contributors</p>
						<p className="text-3xl font-bold">{formatNumber(totals.totalContributors, lang)}</p>
					</div>
				</Card>
				<Card>
					<div className="space-y-2">
						<p className="text-muted-foreground text-sm">Total Contributions Count</p>
						<p className="text-3xl font-bold">{formatNumber(totals.totalContributionsCount, lang)}</p>
					</div>
				</Card>
			</div>
		</section>
	);
};

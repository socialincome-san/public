import { Card } from '@/components/card';
import { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { TransparencyTotals } from '@/lib/services/transparency/transparency.types';

type TotalsSectionProps = {
	totals: TransparencyTotals;
	exchangeRate: number;
	currency: WebsiteCurrency;
	lang: WebsiteLanguage;
};

function formatCurrency(amount: number, currency: string, lang: WebsiteLanguage): string {
	return new Intl.NumberFormat(lang, {
		style: 'currency',
		currency,
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(amount);
}

function formatNumber(value: number, lang: WebsiteLanguage): string {
	return new Intl.NumberFormat(lang).format(value);
}

export function TotalsSection({ totals, exchangeRate, currency, lang }: TotalsSectionProps) {
	const totalContributions = totals.totalContributionsChf * exchangeRate;

	return (
		<section>
			<h2 className="mb-6 text-2xl font-semibold">Overview</h2>
			<div className="grid gap-6 md:grid-cols-3">
				<Card>
					<div className="space-y-2">
						<p className="text-muted-foreground text-sm">Total Contributions</p>
						<p className="text-3xl font-bold">{formatCurrency(totalContributions, currency, lang)}</p>
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
}

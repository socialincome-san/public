import { Card } from '@/components/card';
import type { WebsiteLanguage } from '@/lib/i18n/utils';

type Props = {
	label: string;
	total: number;
	delta: number;
	periodLabel: string;
	lang: WebsiteLanguage;
};

const formatNumber = (value: number, lang: WebsiteLanguage) => {
	return new Intl.NumberFormat(lang).format(value);
};

const formatDelta = (delta: number, periodLabel: string) => {
	return delta > 0 ? `+${delta} ${periodLabel}` : `${delta} ${periodLabel}`;
};

export const StatCard = ({ label, total, delta, periodLabel, lang }: Props) => {
	return (
		<Card>
			<div className="space-y-2">
				<p className="text-muted-foreground text-sm">{label}</p>
				<p className="text-3xl font-bold">{formatNumber(total, lang)}</p>
				<p className="text-muted-foreground text-sm">{formatDelta(delta, periodLabel)}</p>
			</div>
		</Card>
	);
};

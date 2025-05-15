import { useI18n } from '@/components/providers/context-providers';
import { useTranslator } from '@/hooks/useTranslator';
import { WebsiteLanguage } from '@/i18n';
import { Typography } from '@socialincome/ui';

const getTextOption = (amount: number) => {
	const thresholds = [10, 15, 30, 60, 90, 120, 150, 300, Infinity];
	const index = thresholds.findIndex((threshold) => amount < threshold);
	return index === -1 ? 0 : index;
};

type DonationImpactTranslations = {
	yourMonthlyContribution: string;
	directPayout: string;
	yourImpact: string;
};

type DonationImpactProps = {
	lang: WebsiteLanguage;
	monthlyIncome: number;
	translations: DonationImpactTranslations;
};

export function DonationImpact({ lang, monthlyIncome, translations }: DonationImpactProps) {
	const amount = monthlyIncome * 0.01;
	const translator = useTranslator(lang, 'website-donate');
	const { currency } = useI18n();
	const textOption = getTextOption(amount);

	return (
		<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
			<div className="space-y-2">
				<Typography size="lg" weight="medium">
					{translations.yourMonthlyContribution}
				</Typography>
				<Typography size="xl" weight="bold">
					{translator?.t('amount-currency', {
						context: { amount: amount, currency: currency, locale: lang },
					})}
				</Typography>
				<Typography size="md">{translations.directPayout}</Typography>
			</div>
			<div className="space-y-2">
				<Typography size="lg" weight="medium">
					{translations.yourImpact}
				</Typography>
				<Typography>
					{translator?.t(`donation-impact.${textOption}`, {
						context: { amount: amount, currency: currency, locale: lang },
					})}
				</Typography>
			</div>
		</div>
	);
}

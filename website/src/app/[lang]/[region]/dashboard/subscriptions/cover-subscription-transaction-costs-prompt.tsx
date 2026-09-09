'use client';

import { type Currency } from '@/generated/prisma/client';
import { useTranslator } from '@/lib/hooks/useTranslator';
import { type WebsiteLanguage } from '@/lib/i18n/utils';
import { getOnlineTransactionCost } from '@/lib/services/subscription/cover-transaction-costs';
import { formatCurrencyLocale } from '@/lib/utils/string-utils';

const feeCurrencyFormatOptions = {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
} as const;

type Props = {
	lang: WebsiteLanguage;
	amount: number;
	currency: Currency;
	onOpen: () => void;
};

export const CoverSubscriptionTransactionCostsPrompt = ({ lang, amount, currency, onOpen }: Props) => {
	const translator = useTranslator(lang, 'website-me');
	const feeLabel = formatCurrencyLocale(getOnlineTransactionCost(amount), currency, lang, feeCurrencyFormatOptions);
	const t = (key: string, context?: { fee: string }) => translator?.t(key, context ? { context } : undefined) ?? key;

	return (
		<button
			type="button"
			className="w-full bg-[#fef8ee] px-3 py-3 text-left text-sm leading-snug text-[#083344] transition-opacity hover:opacity-90 sm:px-4 sm:py-3.5 sm:leading-5"
			onClick={onOpen}
			data-testid="cover-subscription-transaction-costs-prompt"
		>
			<span>{t('subscriptions.cover-transaction-costs.nudge-prefix')} </span>
			<span className="font-bold">{t('subscriptions.cover-transaction-costs.nudge-fee', { fee: feeLabel })}</span>
			<span> {t('subscriptions.cover-transaction-costs.nudge-middle')} </span>
			<span className="font-bold">
				{t('subscriptions.cover-transaction-costs.nudge-cta')}
				<span className="whitespace-nowrap"> ›</span>
			</span>
		</button>
	);
};

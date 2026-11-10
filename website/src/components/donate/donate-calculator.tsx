'use client';

import { DonateActions } from '@/components/donate/donate-actions';
import { INCOME_SLIDER, useDonateAmount } from '@/components/donate/donate-amount-context';
import { ZEWO_NPO_DETAIL_URL } from '@/components/donation-wizard/steps/step-amount/donation-amount-fields';
import { getBeneficiaryImpact } from '@/components/donation-wizard/utils/donation-amount';
import { OUTFLOW_REACH_PERCENT } from '@/components/outflows/outflows-spend';
import { ImpactPaymentLogos } from '@/components/payment-logos/impact-payment-logos';
import { useIsSwissVisitor } from '@/lib/geo/visitor-country';
import { CertificationBadge } from '@socialincome/design-system/data-display/certification-badge/certification-badge';
import { CheckList } from '@socialincome/design-system/data-display/check-list/check-list';
import { ResultSummary } from '@socialincome/design-system/data-display/result-summary/result-summary';
import { Separator } from '@socialincome/design-system/data-display/separator/separator';
import { AmountField } from '@socialincome/design-system/forms/amount-field/amount-field';
import { AmountSlider } from '@socialincome/design-system/forms/amount-slider/amount-slider';
import { SplitCard } from '@socialincome/design-system/layout/split-card/split-card';
import { useTranslations } from 'next-intl';

// Same quick picks as the donation box
const CUSTOM_AMOUNT_CHIPS = [40, 60, 100] as const;

export const DonateCalculator = () => {
	const t = useTranslations('website-donate.page');
	const isSwissVisitor = useIsSwissVisitor();
	const {
		currency,
		mode,
		setMode,
		income,
		setIncome,
		customAmount,
		setCustomAmount,
		error,
		donation,
		format,
		formatAmount,
	} = useDonateAmount();

	return (
		<SplitCard
			footer={
				<>
					<div className="flex flex-wrap items-center gap-3">
						<span>{t('pay-with')}</span>
						<ImpactPaymentLogos />
					</div>
					{isSwissVisitor ? (
						<CertificationBadge label={t('zewo')} imageSrc="/assets/zewo.svg" href={ZEWO_NPO_DETAIL_URL} />
					) : null}
				</>
			}
			aside={
				<>
					<ResultSummary
						label={t(mode === 'percent' ? 'result-percent' : 'result-own')}
						currency={currency}
						value={format(donation)}
						suffix={t('suffix-monthly')}
					>
						{t('projection', { amount: formatAmount(donation * 12) })}
					</ResultSummary>
					<CheckList
						items={[
							t('impact-monthly', getBeneficiaryImpact(donation)),
							t('cancel-anytime'),
							t('full-amount', { percent: OUTFLOW_REACH_PERCENT }),
						]}
					/>
					<DonateActions />
				</>
			}
		>
			<AmountSlider
				label={t('income-label')}
				currency={currency}
				value={income}
				formattedValue={format(income)}
				min={INCOME_SLIDER.min}
				max={INCOME_SLIDER.max}
				step={INCOME_SLIDER.step}
				onValueChange={setIncome}
				inactive={mode !== 'percent'}
				onActivate={() => setMode('percent')}
			/>
			<Separator label={t('choose-own-amount')} />
			<AmountField
				label={`${t('custom-amount-label')} (${currency})`}
				size="lg"
				pattern="[0-9]*"
				autoComplete="off"
				value={customAmount === null ? '' : String(customAmount)}
				onChange={(event) => {
					// Whole numbers only, also when pasting
					const digits = event.target.value.replace(/\D/g, '');
					setCustomAmount(digits === '' ? null : Number(digits));
				}}
				quickPicks={CUSTOM_AMOUNT_CHIPS.map((value) => ({ value, ariaLabel: formatAmount(value) }))}
				quickPicksVisibility="always"
				selectedQuickPick={customAmount}
				onQuickPickSelect={setCustomAmount}
				error={error}
				inactive={mode !== 'own'}
				onFocus={() => setMode('own')}
				onPointerDown={() => setMode('own')}
			/>
		</SplitCard>
	);
};

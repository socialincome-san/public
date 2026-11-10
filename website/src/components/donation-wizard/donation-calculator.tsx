'use client';

import { OUTFLOW_REACH_PERCENT } from '@/components/outflows/outflows-spend';
import { ImpactPaymentLogos } from '@/components/payment-logos/impact-payment-logos';
import { useIsSwissVisitor } from '@/lib/geo/visitor-country';
import { useWebsiteCurrency } from '@/lib/i18n/website-currency';
import { formatNumberLocale } from '@/lib/utils/string-utils';
import { Button } from '@socialincome/design-system/actions/button/button';
import { AmountDisplay } from '@socialincome/design-system/data-display/amount-display/amount-display';
import { CertificationBadge } from '@socialincome/design-system/data-display/certification-badge/certification-badge';
import { CheckList } from '@socialincome/design-system/data-display/check-list/check-list';
import { Separator } from '@socialincome/design-system/data-display/separator/separator';
import { AmountField } from '@socialincome/design-system/forms/amount-field/amount-field';
import { AmountSlider } from '@socialincome/design-system/forms/amount-slider/amount-slider';
import { SplitCard } from '@socialincome/design-system/layout/split-card/split-card';
import { useLocale, useTranslations } from 'next-intl';
import { useAmountInput } from './hooks/use-amount-input';
import { useDonationFormState } from './hooks/use-donation-form-state';
import { useDonationModal } from './hooks/use-donation-modal';
import { observeDonationForm } from './resume-bar/donation-form-visibility';
import { ZEWO_NPO_DETAIL_URL } from './steps/step-amount/donation-amount-fields';
import {
	CUSTOM_AMOUNT_QUICK_PICKS,
	DONATION_CUSTOM_AMOUNT_MAX,
	DONATION_CUSTOM_AMOUNT_MIN,
	getBeneficiaryImpact,
	type Cadence,
} from './utils/donation-amount';

// Steps of 100 change the 1 % by one
const INCOME_SLIDER = { min: 1000, max: 15000, step: 100 };

export const DonationCalculator = () => {
	const t = useTranslations('donation-wizard');
	const locale = useLocale();
	const currency = useWebsiteCurrency();
	const isSwissVisitor = useIsSwissVisitor();
	const { openWizardWithFormAmount } = useDonationModal();
	const form = useDonationFormState();
	const customAmount = useAmountInput({
		value: form.customAmount,
		onChange: form.setCustomAmount,
		min: DONATION_CUSTOM_AMOUNT_MIN,
		max: DONATION_CUSTOM_AMOUNT_MAX,
		currency,
	});

	const income = form.monthlyIncome ?? INCOME_SLIDER.min;
	// Null while the own amount is empty or invalid
	const amount = form.resolvedAmount;
	const formatAmount = (value: number) => `${currency} ${formatNumberLocale(value, locale)}`;
	const openWizard = (cadence: Cadence) => openWizardWithFormAmount({ ...form.context, cadence });
	const selectOnePercent = () => {
		customAmount.reset();
		form.selectOnePercent();
	};

	return (
		// Like the donation form: keeps the income out of session recordings and hides the resume bar while visible
		<div data-clarity-mask="true" ref={observeDonationForm}>
			<SplitCard
				aside={
					<>
						<AmountDisplay
							label={t(form.onePercentSelected ? 'stepAmount.your-one-percent' : 'calculator.your-donation')}
							currency={currency}
							value={formatNumberLocale(amount ?? 0, locale)}
							suffix={t('calculator.per-month')}
						>
							{t('calculator.per-year', { amount: formatAmount((amount ?? 0) * 12) })}
						</AmountDisplay>
						<CheckList
							items={[
								...(amount === null ? [] : [t('calculator.beneficiaries', getBeneficiaryImpact(amount))]),
								t('impact.cancel-anytime'),
								t('calculator.reach', { percent: OUTFLOW_REACH_PERCENT }),
							]}
						/>
						<div className="flex flex-col gap-4">
							<Button fullWidth disabled={!form.isValid} onClick={() => openWizard('monthly')}>
								{amount === null
									? t('stepAmount.switch-to-monthly')
									: t('stepAmount.donate-monthly-with-amount', { amount: formatAmount(amount) })}
							</Button>
							<Button variant="link" size="inline" disabled={!form.isValid} onClick={() => openWizard('one-time')}>
								{amount === null
									? t('stepAmount.switch-to-one-time')
									: t('stepAmount.switch-to-one-time-with-amount', { amount: formatAmount(amount) })}
							</Button>
						</div>
					</>
				}
				footer={
					<>
						<div className="flex flex-wrap items-center gap-3">
							{t('impact.pay-with')}
							<ImpactPaymentLogos />
						</div>
						{isSwissVisitor ? (
							<CertificationBadge label={t('impact.zewo')} imageSrc="/assets/zewo.svg" href={ZEWO_NPO_DETAIL_URL} />
						) : null}
					</>
				}
			>
				<AmountSlider
					label={t('stepAmount.monthly-income-label')}
					currency={currency}
					value={income}
					formattedValue={formatNumberLocale(income, locale)}
					min={INCOME_SLIDER.min}
					max={INCOME_SLIDER.max}
					step={INCOME_SLIDER.step}
					onValueChange={form.setMonthlyIncome}
					inactive={!form.onePercentSelected}
					onActivate={selectOnePercent}
				/>
				<Separator label={t('stepAmount.choose-own-amount')} />
				<AmountField
					size="lg"
					label={`${t('stepAmount.custom-amount-label')} (${currency})`}
					value={customAmount.text}
					error={customAmount.hint}
					inactive={form.onePercentSelected}
					onFocus={() => {
						if (form.onePercentSelected) {
							form.setPresetAmount('other');
						}
					}}
					onChange={customAmount.onChange}
					quickPicks={CUSTOM_AMOUNT_QUICK_PICKS.map((value) => ({ value, ariaLabel: formatAmount(value) }))}
					selectedQuickPick={form.customAmount}
					onQuickPickSelect={(value) => {
						customAmount.reset();
						form.setCustomAmount(value);
					}}
				/>
			</SplitCard>
		</div>
	);
};

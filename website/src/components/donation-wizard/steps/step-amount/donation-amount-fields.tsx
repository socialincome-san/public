'use client';

import { useIsSwissVisitor } from '@/lib/geo/visitor-country';
import type { WebsiteCurrency } from '@/lib/i18n/utils';
import { Button } from '@socialincome/design-system/actions/button/button';
import { cn } from '@socialincome/design-system/cn';
import { AmountField } from '@socialincome/design-system/forms/amount-field/amount-field';
import { Input } from '@socialincome/design-system/forms/input/input';
import { useTranslations } from 'next-intl';
import NextImage from 'next/image';
import { useId } from 'react';
import { useAmountInput } from '../../hooks/use-amount-input';
import {
	CUSTOM_AMOUNT_QUICK_PICKS,
	DONATION_CUSTOM_AMOUNT_MAX,
	DONATION_CUSTOM_AMOUNT_MIN,
	DONATION_MONTHLY_INCOME_MAX,
	DONATION_MONTHLY_INCOME_MIN,
	type Cadence,
	type PresetAmount,
} from '../../utils/donation-amount';
import { getDonationWizardCardClass } from '../../utils/donation-wizard-layout';

const amountFieldBorder = 'border-input/60';
const amountTextClass = 'text-lg leading-none font-medium';

const submitLabelKeys = {
	monthly: 'stepAmount.donate-monthly-with-amount',
	'one-time': 'stepAmount.donate-now-with-amount',
} as const;

const switchCadenceLabelKeys = {
	monthly: { withoutAmount: 'stepAmount.switch-to-monthly', withAmount: 'stepAmount.switch-to-monthly-with-amount' },
	'one-time': {
		withoutAmount: 'stepAmount.switch-to-one-time',
		withAmount: 'stepAmount.switch-to-one-time-with-amount',
	},
} as const;

export const ZEWO_NPO_DETAIL_URL = 'https://zewo.ch/npo-detail/?relief_organization=social-income';

type DonationAmountFieldsValues = {
	monthlyIncome: number | null;
	selectedAmount: PresetAmount | 'other' | null;
	customAmount: number | null;
	cadence: Cadence;
	onePercent: number;
	onePercentSelected: boolean;
	resolvedAmount: number | null;
	isValid: boolean;
};

type DonationAmountFieldsActions = {
	selectOnePercent: () => void;
	setMonthlyIncome: (value: number | null) => void;
	setPresetAmount: (value: PresetAmount | 'other') => void;
	setCustomAmount: (value: number | null) => void;
};

type Props = {
	values: DonationAmountFieldsValues;
	actions: DonationAmountFieldsActions;
	onSubmit: (cadence: Cadence) => void;
	placement?: 'wizard' | 'hero';
	currency: WebsiteCurrency;
	showTitle?: boolean;
};

export const DonationAmountFields = ({
	values,
	actions,
	onSubmit,
	placement = 'wizard',
	currency,
	showTitle = true,
}: Props) => {
	const t = useTranslations('donation-wizard');
	const isSwissVisitor = useIsSwissVisitor();
	// The hero renders this twice (mobile and desktop), so ids must be unique per instance
	const id = useId();
	const monthlyIncome = useAmountInput({
		value: values.monthlyIncome,
		onChange: actions.setMonthlyIncome,
		min: DONATION_MONTHLY_INCOME_MIN,
		max: DONATION_MONTHLY_INCOME_MAX,
		currency,
	});
	// The campaign form preselects a preset amount; this step has no presets, so it shows it as a custom amount
	const customAmountValue = typeof values.selectedAmount === 'number' ? values.selectedAmount : values.customAmount;
	const customAmount = useAmountInput({
		value: customAmountValue,
		onChange: actions.setCustomAmount,
		min: DONATION_CUSTOM_AMOUNT_MIN,
		max: DONATION_CUSTOM_AMOUNT_MAX,
		currency,
	});

	const isCustomAmount = !values.onePercentSelected;
	const otherCadence: Cadence = values.cadence === 'monthly' ? 'one-time' : 'monthly';
	const amount = values.resolvedAmount === null ? null : `${currency} ${values.resolvedAmount}`;

	const selectOnePercent = () => {
		customAmount.reset();
		actions.selectOnePercent();
	};

	return (
		<div
			className={cn(
				getDonationWizardCardClass('stepAmount'),
				placement === 'hero' && 'mx-0 max-w-none px-7 pt-6 pb-7 sm:px-7 sm:pt-6 lg:mx-auto lg:w-[400px]',
				'text-foreground md:px-9 md:py-9',
			)}
			data-testid="donation-wizard-step-amount"
		>
			{showTitle && (
				<div className="mb-4 flex items-center justify-between gap-3">
					<h2 className="text-foreground text-xl leading-tight font-bold text-pretty sm:text-2xl sm:leading-none">
						{t(isCustomAmount ? 'stepAmount.title-custom-amount' : 'stepAmount.title')}
					</h2>
					{/* Negative margin keeps the card height that donationHeroCardSizeClass snapshots. */}
					{placement === 'hero' && isSwissVisitor && (
						<a
							href={ZEWO_NPO_DETAIL_URL}
							target="_blank"
							rel="noopener noreferrer"
							className="-my-2 shrink-0"
							aria-label={t('impact.zewo')}
						>
							<NextImage src="/assets/zewo.svg" alt="" width={38} height={37} className="size-[38px]" />
						</a>
					)}
				</div>
			)}

			<div
				className={cn(
					amountFieldBorder,
					'focus-within:border-ring focus-within:ring-ring/50 mb-4 grid grid-cols-[minmax(0,1fr)_auto] overflow-hidden rounded-md border transition-[opacity,border-color,box-shadow] focus-within:ring-[3px]',
					isCustomAmount && 'opacity-60',
				)}
			>
				<div
					className={cn(
						amountFieldBorder,
						'bg-card border-r px-4 py-3 transition-colors',
						values.onePercentSelected ? 'text-foreground' : 'text-muted-foreground',
					)}
				>
					<label htmlFor={`${id}-monthly-income`} className="text-2xs block font-medium">
						{t('stepAmount.monthly-income-label')} ({currency})
					</label>
					<div className={amountTextClass}>
						<Input
							variant="bare"
							id={`${id}-monthly-income`}
							data-testid="donation-wizard-monthly-income"
							inputMode="numeric"
							value={monthlyIncome.text}
							aria-invalid={monthlyIncome.hint !== undefined}
							aria-describedby={monthlyIncome.hint === undefined ? undefined : `${id}-monthly-income-hint`}
							onFocus={selectOnePercent}
							onChange={monthlyIncome.onChange}
						/>
					</div>
				</div>
				<button
					type="button"
					data-testid="donation-wizard-one-percent"
					aria-pressed={values.onePercentSelected}
					onClick={selectOnePercent}
					className={cn(
						'px-4 py-3 text-left transition-colors',
						values.onePercentSelected
							? 'bg-muted text-foreground'
							: 'text-muted-foreground bg-card hover:bg-muted/50 hover:text-foreground',
					)}
				>
					<div className="text-2xs font-medium">
						{t('stepAmount.your-one-percent')} ({currency})
					</div>
					<div className={cn(amountTextClass, 'py-0.5 whitespace-nowrap')}>{values.onePercent}</div>
				</button>
			</div>
			{monthlyIncome.hint !== undefined && (
				<p id={`${id}-monthly-income-hint`} className="text-destructive text-2xs -mt-2 mb-4 font-medium">
					{monthlyIncome.hint}
				</p>
			)}

			<div className="mb-4 flex items-center gap-4">
				<div className={cn(amountFieldBorder, 'h-px flex-1 border-t')} aria-hidden />
				<div className="text-2xs text-center font-medium">{t('stepAmount.choose-own-amount')}</div>
				<div className={cn(amountFieldBorder, 'h-px flex-1 border-t')} aria-hidden />
			</div>
			<div className="mb-4">
				<AmountField
					label={`${t('stepAmount.custom-amount-label')} (${currency})`}
					data-testid="donation-wizard-custom-amount"
					value={customAmount.text}
					error={customAmount.hint}
					inactive={!isCustomAmount}
					onFocus={() => {
						if (!isCustomAmount) {
							actions.setPresetAmount('other');
						}
					}}
					onChange={customAmount.onChange}
					quickPicks={CUSTOM_AMOUNT_QUICK_PICKS.map((chip) => ({ value: chip, ariaLabel: `${currency} ${chip}` }))}
					selectedQuickPick={customAmountValue}
					onQuickPickSelect={(chip) => {
						customAmount.reset();
						actions.setCustomAmount(chip);
					}}
				/>
			</div>

			<Button
				type="button"
				data-testid="donation-wizard-amount-continue"
				fullWidth
				disabled={!values.isValid}
				onClick={() => onSubmit(values.cadence)}
			>
				{amount === null ? t('stepAmount.donate-now') : t(submitLabelKeys[values.cadence], { amount })}
			</Button>
			<button
				type="button"
				data-testid={`donation-wizard-cadence-${otherCadence}`}
				disabled={!values.isValid}
				onClick={() => onSubmit(otherCadence)}
				className="text-muted-foreground hover:text-foreground mt-4 -mb-2 block w-full cursor-pointer text-center text-xs font-medium underline underline-offset-4 transition-colors disabled:pointer-events-none disabled:opacity-50 md:-mb-4"
			>
				{amount === null
					? t(switchCadenceLabelKeys[otherCadence].withoutAmount)
					: t(switchCadenceLabelKeys[otherCadence].withAmount, { amount })}
			</button>
		</div>
	);
};

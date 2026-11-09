'use client';

import { useIsSwissVisitor } from '@/lib/geo/visitor-country';
import type { WebsiteCurrency } from '@/lib/i18n/utils';
import { formatNumberLocale } from '@/lib/utils/string-utils';
import { Button } from '@socialincome/design-system/actions/button/button';
import { cn } from '@socialincome/design-system/cn';
import { AmountField } from '@socialincome/design-system/forms/amount-field/amount-field';
import { Input } from '@socialincome/design-system/forms/input/input';
import { useLocale, useTranslations } from 'next-intl';
import NextImage from 'next/image';
import { useId, useState, type ChangeEvent } from 'react';
import {
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

const customAmountChips = [40, 60, 100];

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

type AmountError = 'not-whole' | 'below-min' | 'above-max';

// Apostrophes and spaces are thousands separators. A dot or comma may be a decimal separator,
// so 10.50 is rejected instead of being read as 1050.
const parseWholeAmount = (text: string, max: number): { value: number | null } | { error: AmountError } => {
	const digits = text.replace(/['’\s]/g, '');
	if (digits === '') {
		return { value: null };
	}
	if (!/^\d+$/.test(digits)) {
		return { error: 'not-whole' };
	}
	const value = Number(digits);

	return value > max ? { error: 'above-max' } : { value };
};

// Rejected text stays in the field so the person sees what to fix; only valid amounts reach the form state.
const useAmountInput = (value: number | null, onChange: (value: number | null) => void, min: number, max: number) => {
	const [rejected, setRejected] = useState<{ text: string; error: AmountError } | null>(null);

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		const result = parseWholeAmount(event.target.value, max);
		setRejected('error' in result ? { text: event.target.value, error: result.error } : null);
		onChange('error' in result ? null : result.value);
	};

	return {
		text: rejected?.text ?? value?.toString() ?? '',
		error: rejected?.error ?? (value !== null && value < min ? 'below-min' : null),
		onChange: handleChange,
		reset: () => setRejected(null),
	};
};

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
	const locale = useLocale();
	const isSwissVisitor = useIsSwissVisitor();
	// The hero renders this twice (mobile and desktop), so ids must be unique per instance
	const id = useId();
	const monthlyIncome = useAmountInput(
		values.monthlyIncome,
		actions.setMonthlyIncome,
		DONATION_MONTHLY_INCOME_MIN,
		DONATION_MONTHLY_INCOME_MAX,
	);
	const customAmount = useAmountInput(
		values.customAmount,
		actions.setCustomAmount,
		DONATION_CUSTOM_AMOUNT_MIN,
		DONATION_CUSTOM_AMOUNT_MAX,
	);

	const isCustomAmount = values.selectedAmount === 'other';
	const otherCadence: Cadence = values.cadence === 'monthly' ? 'one-time' : 'monthly';
	const amount = values.resolvedAmount === null ? null : `${currency} ${values.resolvedAmount}`;

	const formatLimit = (limit: number) => `${currency} ${formatNumberLocale(limit, locale)}`;
	const getHint = (error: AmountError, min: number, max: number) => {
		switch (error) {
			case 'not-whole':
				return t('stepAmount.whole-amount-only');
			case 'below-min':
				return t('stepAmount.below-minimum', { amount: formatLimit(min) });
			case 'above-max':
				return t('stepAmount.above-maximum', { amount: formatLimit(max) });
		}
	};

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
							aria-invalid={monthlyIncome.error !== null}
							aria-describedby={monthlyIncome.error === null ? undefined : `${id}-monthly-income-hint`}
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
			{monthlyIncome.error !== null && (
				<p id={`${id}-monthly-income-hint`} className="text-destructive text-2xs -mt-2 mb-4 font-medium">
					{getHint(monthlyIncome.error, DONATION_MONTHLY_INCOME_MIN, DONATION_MONTHLY_INCOME_MAX)}
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
					error={
						customAmount.error === null
							? undefined
							: getHint(customAmount.error, DONATION_CUSTOM_AMOUNT_MIN, DONATION_CUSTOM_AMOUNT_MAX)
					}
					inactive={!isCustomAmount}
					onFocus={() => {
						if (!isCustomAmount) {
							actions.setPresetAmount('other');
						}
					}}
					onChange={customAmount.onChange}
					quickPicks={customAmountChips.map((chip) => ({ value: chip, ariaLabel: `${currency} ${chip}` }))}
					selectedQuickPick={values.customAmount}
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

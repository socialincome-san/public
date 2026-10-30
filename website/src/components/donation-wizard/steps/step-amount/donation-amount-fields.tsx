'use client';

import { useIsSwissVisitor } from '@/lib/geo/visitor-country';
import type { WebsiteCurrency } from '@/lib/i18n/utils';
import { Button } from '@socialincome/design-system/actions/button/button';
import { cn } from '@socialincome/design-system/cn';
import { Input } from '@socialincome/design-system/forms/input/input';
import { useTranslations } from 'next-intl';
import NextImage from 'next/image';
import { useId, useState } from 'react';
import {
	DONATION_CUSTOM_AMOUNT_MAX,
	DONATION_MONTHLY_INCOME_MAX,
	type Cadence,
	type PresetAmount,
} from '../../utils/donation-amount';
import { getDonationWizardCardClass } from '../../utils/donation-wizard-layout';

const amountFieldBorder = 'border-input/60';
const monthlyAmountTextClass = 'text-lg leading-none font-medium';

// Both amount fields take whole numbers only, so everything but digits is dropped while typing
const parseWholeNumber = (raw: string): number | null => {
	const digits = raw.replace(/\D/g, '');

	return digits === '' ? null : Number(digits);
};

// Quick picks shown inside the custom amount field while it is focused
const customAmountChips = [40, 60, 100] as const;

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
	// Submits the amount with the given cadence, so the link below the button can go straight into the other cadence's flow
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
	// The hero renders the box twice (mobile and desktop), so labels need ids unique per instance
	const idPrefix = useId();
	const monthlyIncomeInputId = `${idPrefix}-monthly-income`;
	const customAmountInputId = `${idPrefix}-custom-amount`;
	const [isCustomAmountFocused, setIsCustomAmountFocused] = useState(false);
	const isCustomAmountActive = isCustomAmountFocused || values.selectedAmount === 'other';
	const isCustomAmountLabelFloating = isCustomAmountFocused || values.customAmount !== null;
	// While the custom amount field is in use, the 1 % row looks inactive like the custom field does otherwise
	const isOnePercentDimmed = isCustomAmountActive;

	return (
		<div
			className={cn(
				getDonationWizardCardClass('stepAmount'),
				placement === 'hero' && 'mx-0 max-w-none px-7 pt-6 pb-7 sm:px-7 sm:pt-6 sm:pb-7 lg:mx-auto lg:w-[400px]',
				'text-foreground md:px-9 md:py-9',
			)}
			data-testid="donation-wizard-step-amount"
		>
			{showTitle && (
				<div className="mb-4 flex items-center justify-between gap-3">
					<h2 className="text-foreground text-xl leading-tight font-bold text-pretty sm:text-2xl sm:leading-none">
						{/* A custom amount is no longer the 1 %, so the headline turns neutral while it is in use */}
						{t(isCustomAmountActive ? 'stepAmount.title-custom-amount' : 'stepAmount.title')}
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
					isOnePercentDimmed && 'opacity-60',
				)}
			>
				<div
					className={cn(
						amountFieldBorder,
						'bg-card border-r px-4 py-3 transition-colors',
						values.onePercentSelected ? 'text-foreground' : 'text-muted-foreground',
					)}
				>
					<label htmlFor={monthlyIncomeInputId} className="text-2xs block font-medium">
						{t('stepAmount.monthly-income-label')} ({currency})
					</label>
					<div className={monthlyAmountTextClass}>
						<Input
							variant="bare"
							id={monthlyIncomeInputId}
							data-testid="donation-wizard-monthly-income"
							type="text"
							inputMode="numeric"
							pattern="[0-9]*"
							value={values.monthlyIncome ?? ''}
							onFocus={actions.selectOnePercent}
							onChange={(e) => {
								const parsed = parseWholeNumber(e.target.value);
								if (parsed === null) {
									actions.setMonthlyIncome(null);

									return;
								}

								if (parsed <= DONATION_MONTHLY_INCOME_MAX) {
									actions.setMonthlyIncome(parsed);
								}
							}}
						/>
					</div>
				</div>
				<button
					type="button"
					data-testid="donation-wizard-one-percent"
					aria-pressed={values.onePercentSelected}
					onClick={actions.selectOnePercent}
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
					<div className={cn(monthlyAmountTextClass, 'py-0.5 whitespace-nowrap')}>{values.onePercent}</div>
				</button>
			</div>

			<div className="mb-4 flex items-center gap-4">
				<div className={cn(amountFieldBorder, 'h-px flex-1 border-t')} aria-hidden />
				<div className="text-2xs text-center font-medium">{t('stepAmount.choose-own-amount')}</div>
				<div className={cn(amountFieldBorder, 'h-px flex-1 border-t')} aria-hidden />
			</div>
			<div
				className={cn(
					amountFieldBorder,
					'focus-within:border-ring focus-within:ring-ring/50 relative mb-4 rounded-md border px-4 py-3 transition-[border-color,box-shadow,background-color,color] focus-within:ring-[3px]',
					isCustomAmountActive ? 'bg-card text-foreground' : 'bg-card text-muted-foreground opacity-60',
				)}
			>
				{/* Floating label: rests in the middle while the field is empty, moves up once it is focused or filled */}
				<label
					htmlFor={customAmountInputId}
					className={cn(
						'absolute left-4 cursor-text font-medium transition-all',
						isCustomAmountLabelFloating ? 'text-2xs top-3' : 'top-1/2 -translate-y-1/2 text-sm',
					)}
				>
					{t('stepAmount.custom-amount-label')} ({currency})
				</label>
				<div className="h-3.5" aria-hidden />
				{/* The chips share the number's row; the shift puts their bottom edge on the bottom of the digits */}
				<div className={cn(monthlyAmountTextClass, 'flex items-baseline gap-2')}>
					<Input
						variant="bare"
						id={customAmountInputId}
						type="text"
						inputMode="numeric"
						pattern="[0-9]*"
						data-testid="donation-wizard-custom-amount"
						value={values.customAmount ?? ''}
						onFocus={() => {
							setIsCustomAmountFocused(true);
							if (values.selectedAmount !== 'other') {
								actions.setPresetAmount('other');
							}
						}}
						onBlur={() => setIsCustomAmountFocused(false)}
						onChange={(e) => {
							const parsed = parseWholeNumber(e.target.value);
							if (parsed === null) {
								actions.setCustomAmount(null);

								return;
							}
							if (parsed <= DONATION_CUSTOM_AMOUNT_MAX) {
								actions.setCustomAmount(parsed);
							}
						}}
					/>
					{/* The chips only show while the field is focused; mouse down on them keeps the focus */}
					{isCustomAmountFocused && (
						<div className="-my-1 flex shrink-0 -translate-y-2 gap-1.5">
							{customAmountChips.map((amount) => (
								<button
									key={amount}
									type="button"
									data-testid={`donation-wizard-custom-amount-chip-${amount}`}
									aria-pressed={values.customAmount === amount}
									// The field label already names the currency, so the chips only show the number
									aria-label={`${currency} ${amount}`}
									// Keeps the focus in the field so the chips stay visible while clicking
									onMouseDown={(e) => e.preventDefault()}
									onClick={() => actions.setCustomAmount(amount)}
									className={cn(
										amountFieldBorder,
										'text-2xs cursor-pointer rounded-full border px-2.5 py-1 font-medium whitespace-nowrap transition-colors',
										values.customAmount === amount
											? 'bg-muted text-foreground'
											: 'bg-card text-muted-foreground hover:bg-muted/50 hover:text-foreground',
									)}
								>
									{amount}
								</button>
							))}
						</div>
					)}
				</div>
			</div>

			<Button
				type="button"
				data-testid="donation-wizard-amount-continue"
				fullWidth
				disabled={!values.isValid}
				onClick={() => onSubmit(values.cadence)}
			>
				{values.resolvedAmount === null
					? t('stepAmount.donate-now')
					: values.cadence === 'monthly'
						? t('stepAmount.donate-monthly-with-amount', { amount: `${currency} ${values.resolvedAmount}` })
						: t('stepAmount.donate-now-with-amount', { amount: `${currency} ${values.resolvedAmount}` })}
			</Button>
			{/* Monthly is the default; the other cadence is a quiet text link below the button that donates with that cadence */}
			<button
				type="button"
				data-testid={values.cadence === 'monthly' ? 'donation-wizard-cadence-one-time' : 'donation-wizard-cadence-monthly'}
				disabled={!values.isValid}
				onClick={() => onSubmit(values.cadence === 'monthly' ? 'one-time' : 'monthly')}
				className="text-muted-foreground hover:text-foreground mt-4 -mb-2 block w-full cursor-pointer text-center text-xs font-medium underline underline-offset-4 transition-colors disabled:pointer-events-none disabled:opacity-50 md:-mb-4"
			>
				{values.resolvedAmount === null
					? t(values.cadence === 'monthly' ? 'stepAmount.switch-to-one-time' : 'stepAmount.switch-to-monthly')
					: t(
							values.cadence === 'monthly'
								? 'stepAmount.switch-to-one-time-with-amount'
								: 'stepAmount.switch-to-monthly-with-amount',
							{ amount: `${currency} ${values.resolvedAmount}` },
						)}
			</button>
		</div>
	);
};

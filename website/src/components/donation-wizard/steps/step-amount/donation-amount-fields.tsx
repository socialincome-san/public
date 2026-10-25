'use client';

import { useIsSwissVisitor } from '@/lib/geo/visitor-country';
import type { WebsiteCurrency } from '@/lib/i18n/utils';
import { Button } from '@socialincome/design-system/actions/button/button';
import { cn } from '@socialincome/design-system/cn';
import { Input } from '@socialincome/design-system/forms/input/input';
import { useTranslations } from 'next-intl';
import NextImage from 'next/image';
import {
	DONATION_CUSTOM_AMOUNT_MAX,
	DONATION_CUSTOM_AMOUNT_MIN,
	DONATION_MONTHLY_INCOME_MAX,
	DONATION_MONTHLY_INCOME_MIN,
	type Cadence,
	type PresetAmount,
} from '../../utils/donation-amount';
import { getDonationWizardCardClass } from '../../utils/donation-wizard-layout';

const amountOptions: { labelKey: 'currency-prefix' | 'other'; value: PresetAmount | 'other' }[] = [
	{ labelKey: 'currency-prefix', value: 25 },
	{ labelKey: 'currency-prefix', value: 50 },
	{ labelKey: 'currency-prefix', value: 100 },
	{ labelKey: 'other', value: 'other' },
];

const segmentActive = 'bg-card shadow-xs';

const amountFieldBorder = 'border-input/60';
const amountFieldDivider = 'divide-input/60';
const monthlyAmountTextClass = 'text-lg leading-none font-medium';

const monthlyIncomeInputId = 'donation-monthly-income';

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
	setCadence: (value: Cadence) => void;
};

type Props = {
	values: DonationAmountFieldsValues;
	actions: DonationAmountFieldsActions;
	onSubmit: () => void;
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
						{t('stepAmount.title')}
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

			<div className="bg-accent mb-4 grid grid-cols-2 rounded-md p-1">
				<button
					type="button"
					data-testid="donation-wizard-cadence-monthly"
					aria-pressed={values.cadence === 'monthly'}
					onClick={() => actions.setCadence('monthly')}
					className={cn(
						'cursor-pointer rounded-md px-3 py-2 text-sm font-bold transition-colors',
						values.cadence === 'monthly'
							? cn(segmentActive, 'text-foreground')
							: 'text-muted-foreground hover:text-foreground',
					)}
				>
					{t('stepAmount.monthly')}
				</button>
				<button
					type="button"
					data-testid="donation-wizard-cadence-one-time"
					aria-pressed={values.cadence === 'one-time'}
					onClick={() => actions.setCadence('one-time')}
					className={cn(
						'cursor-pointer rounded-md px-3 py-2 text-sm font-bold transition-colors',
						values.cadence === 'one-time'
							? cn(segmentActive, 'text-foreground')
							: 'text-muted-foreground hover:text-foreground',
					)}
				>
					{t('stepAmount.one-time')}
				</button>
			</div>

			<div className={cn(amountFieldBorder, 'mb-4 grid grid-cols-[minmax(0,1fr)_auto] rounded-md border')}>
				<div
					className={cn(
						amountFieldBorder,
						'bg-card focus-within:border-ring focus-within:ring-ring/50 relative -m-px rounded-l-md border px-4 py-3 transition-[border-color,box-shadow,color] focus-within:z-10 focus-within:ring-[3px]',
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
							type="number"
							min={DONATION_MONTHLY_INCOME_MIN}
							max={DONATION_MONTHLY_INCOME_MAX}
							value={values.monthlyIncome ?? ''}
							onFocus={actions.selectOnePercent}
							onChange={(e) => {
								const raw = e.target.value;
								if (raw === '') {
									actions.setMonthlyIncome(null);

									return;
								}

								const parsed = parseFloat(raw);
								if (!isNaN(parsed) && parsed <= DONATION_MONTHLY_INCOME_MAX) {
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
						'rounded-r-md px-4 py-3 text-left transition-colors',
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
					amountFieldDivider,
					'mb-4 grid grid-cols-4 divide-x overflow-hidden rounded-xl border',
				)}
			>
				{amountOptions.map((option) => {
					const isSelected = option.value === values.selectedAmount;

					return (
						<button
							key={option.value}
							type="button"
							data-testid={`donation-wizard-preset-${option.value}`}
							aria-pressed={isSelected}
							onClick={() => actions.setPresetAmount(option.value)}
							className={cn(
								'flex flex-col items-center justify-center p-2.5 leading-none font-medium transition-colors sm:p-3',
								isSelected ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
							)}
						>
							<span className={cn(option.labelKey === 'other' ? 'text-base' : 'text-2xs')}>
								{option.labelKey === 'other' ? t('stepAmount.other') : currency}
							</span>
							{option.value !== 'other' && <span>{option.value}</span>}
						</button>
					);
				})}
			</div>

			{values.selectedAmount === 'other' && (
				<div className="-mt-2 mb-4">
					<Input
						type="number"
						data-testid="donation-wizard-custom-amount"
						min={DONATION_CUSTOM_AMOUNT_MIN}
						max={DONATION_CUSTOM_AMOUNT_MAX}
						placeholder={t('stepAmount.custom-amount-placeholder')}
						value={values.customAmount ?? ''}
						onChange={(e) => {
							const raw = e.target.value;
							if (raw === '') {
								actions.setCustomAmount(null);

								return;
							}
							const parsed = parseFloat(raw);
							if (!isNaN(parsed) && parsed <= DONATION_CUSTOM_AMOUNT_MAX) {
								actions.setCustomAmount(parsed);
							}
						}}
					/>
				</div>
			)}

			<Button
				type="button"
				data-testid="donation-wizard-amount-continue"
				fullWidth
				disabled={!values.isValid}
				onClick={onSubmit}
			>
				{values.resolvedAmount !== null
					? t('stepAmount.donate-now-with-amount', { amount: `${currency} ${values.resolvedAmount}` })
					: t('stepAmount.donate-now')}
			</Button>
		</div>
	);
};

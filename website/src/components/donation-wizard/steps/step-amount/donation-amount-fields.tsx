'use client';

import type { WebsiteCurrency } from '@/lib/i18n/utils';
import { Button } from '@socialincome/design-system/actions/button/button';
import { cn } from '@socialincome/design-system/cn';
import { Input } from '@socialincome/design-system/forms/input/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@socialincome/design-system/forms/select/select';
import { useLocale, useTranslations } from 'next-intl';
import {
	DONATION_CUSTOM_AMOUNT_MAX,
	DONATION_CUSTOM_AMOUNT_MIN,
	DONATION_MONTHLY_INCOME_MAX,
	DONATION_MONTHLY_INCOME_MIN,
	type Cadence,
	type MonthlyIncomeSource,
	type PresetAmount,
} from '../../utils/donation-amount';
import {
	CURRENCY_CONVERSION_SOURCE,
	getDonationCountryOptions,
	getDonationExampleIncome,
} from '../../utils/donation-example-income';
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
const countrySelectId = 'donation-example-country';

type DonationAmountFieldsValues = {
	monthlyIncome: number | null;
	monthlyIncomeSource: MonthlyIncomeSource;
	exampleCountryCode: string | null;
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
	setCountry: (countryCode: string) => void;
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
	const locale = useLocale();
	const example =
		values.monthlyIncomeSource === 'example' ? getDonationExampleIncome(values.exampleCountryCode, currency) : null;
	const supportedLocale = Intl.DisplayNames.supportedLocalesOf([locale]).length > 0 ? locale : 'en';
	const countryNames = new Intl.DisplayNames([supportedLocale], { type: 'region' });
	const exampleCountryName = example
		? example.countryCode === 'XK'
			? 'Kosovo'
			: (countryNames.of(example.countryCode) ?? example.countryCode)
		: null;
	const selectedCountryName = values.exampleCountryCode
		? values.exampleCountryCode === 'XK'
			? 'Kosovo'
			: (countryNames.of(values.exampleCountryCode) ?? values.exampleCountryCode)
		: null;

	return (
		<div
			className={cn(
				getDonationWizardCardClass('stepAmount'),
				placement === 'hero' && 'mx-0 max-w-none lg:mx-auto lg:w-[400px]',
				'text-foreground md:px-9 md:py-9',
			)}
			data-testid="donation-wizard-step-amount"
		>
			{showTitle && (
				<h2 className="text-foreground mb-5 text-xl leading-tight font-bold text-pretty sm:text-2xl sm:leading-none">
					{t('stepAmount.title')}
				</h2>
			)}

			<div className="mb-3">
				<label htmlFor={countrySelectId} className="text-2xs mb-1 block font-medium">
					{t('stepAmount.country-label')}
				</label>
				<Select value={values.exampleCountryCode ?? ''} onValueChange={actions.setCountry}>
					<SelectTrigger id={countrySelectId} data-testid="donation-wizard-example-country">
						<SelectValue placeholder={t('stepAmount.country-placeholder')} />
					</SelectTrigger>
					<SelectContent>
						{getDonationCountryOptions().map(({ code, name }) => (
							<SelectItem key={code} value={code}>
								{code === 'XK' ? 'Kosovo' : (countryNames.of(code) ?? name)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className={cn(amountFieldBorder, 'mb-3 grid grid-cols-[minmax(0,1fr)_auto] rounded-md border')}>
				<div
					className={cn(
						amountFieldBorder,
						'bg-card focus-within:border-ring focus-within:ring-ring/50 relative -m-px rounded-l-md border px-3 py-2 transition-[border-color,box-shadow,color] focus-within:z-10 focus-within:ring-[3px]',
						values.onePercentSelected ? 'text-foreground' : 'text-muted-foreground',
					)}
				>
					<label htmlFor={monthlyIncomeInputId} className="text-2xs font-medium">
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
						'rounded-r-md px-3 py-2 text-left transition-colors',
						values.onePercentSelected
							? 'bg-muted text-foreground'
							: 'text-muted-foreground bg-card hover:bg-muted/50 hover:text-foreground',
					)}
				>
					<div className="text-2xs font-medium">{t('stepAmount.your-one-percent')}</div>
					<div className={cn(monthlyAmountTextClass, 'whitespace-nowrap')}>
						{currency} {values.onePercent}
					</div>
				</button>
			</div>
			<p className="text-muted-foreground mb-3 text-xs">
				{example ? (
					<>
						{t('stepAmount.example-income-note', {
							country: exampleCountryName ?? example.countryCode,
							metric: t(`stepAmount.wage-metric-${example.metric}`),
							year: example.wageYear,
						})}{' '}
						<a
							href={example.sourceUrl}
							target="_blank"
							rel="noreferrer"
							className="text-foreground underline underline-offset-2"
						>
							{t('stepAmount.source-link', { source: example.sourceName })}
						</a>
						{'. '}
						<a
							href={CURRENCY_CONVERSION_SOURCE}
							target="_blank"
							rel="noreferrer"
							className="text-foreground underline underline-offset-2"
						>
							{t('stepAmount.currency-conversion-note', { year: example.conversionYear })}
						</a>
					</>
				) : values.monthlyIncomeSource === 'manual' ? (
					t('stepAmount.manual-income-note')
				) : selectedCountryName ? (
					t('stepAmount.unsupported-country-note', {
						country: selectedCountryName,
						amount: `${currency} 50`,
					})
				) : (
					t('stepAmount.generic-income-note', { amount: `${currency} 50` })
				)}
			</p>

			<div className="mb-3 flex items-center gap-4">
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

'use client';

import { Button } from '@/components/button';
import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import { useI18n } from '@/lib/i18n/useI18n';
import { cn } from '@/lib/utils/cn';
import { donationStepCardClass } from '../donation-wizard-layout';
import type { Cadence, PresetAmount } from '../wizard/donation-amount';

const amountOptions: { labelKey: 'currency-prefix' | 'other'; value: PresetAmount | 'other' }[] = [
	{ labelKey: 'currency-prefix', value: 25 },
	{ labelKey: 'currency-prefix', value: 50 },
	{ labelKey: 'currency-prefix', value: 100 },
	{ labelKey: 'other', value: 'other' },
];

const segmentActive = 'bg-white shadow-xs';

type DonationFormFieldsValues = {
	monthlyIncome: number;
	selectedAmount: PresetAmount | 'other' | null;
	customAmount: number | null;
	cadence: Cadence;
	onePercent: number;
	onePercentSelected: boolean;
	resolvedAmount: number | null;
	isValid: boolean;
};

type DonationFormFieldsActions = {
	selectOnePercent: () => void;
	setMonthlyIncome: (value: number) => void;
	setPresetAmount: (value: PresetAmount | 'other') => void;
	setCustomAmount: (value: number) => void;
	setCadence: (value: Cadence) => void;
};

type Props = {
	values: DonationFormFieldsValues;
	actions: DonationFormFieldsActions;
	showTitle?: boolean;
	className?: string;
	onSubmit: () => void;
};

export const DonationFormFields = ({ values, actions, showTitle = false, className, onSubmit }: Props) => {
	const { t } = useRouteTranslator({ namespace: 'donation-wizard' });
	const { currency = 'CHF' } = useI18n();

	return (
		<div
			className={cn(
				donationStepCardClass,
				'text-foreground',
				showTitle && 'md:px-9 md:py-9',
				!showTitle && 'md:px-7 md:py-7',
				className,
			)}
		>
			{showTitle && (
				<h3 className="text-foreground mb-5 text-xl leading-tight font-semibold text-pretty sm:text-2xl sm:leading-none">
					{t('step1.title')}
				</h3>
			)}

			<div className="border-muted mb-3 grid grid-cols-1 overflow-hidden rounded-md border sm:grid-cols-[minmax(0,1fr)_auto]">
				<div
					className={cn(
						'border-muted bg-white px-3 py-2 transition-colors sm:border-r',
						values.onePercentSelected ? 'text-foreground' : 'text-muted-foreground',
					)}
				>
					<div className="text-[10px] font-medium">{t('step1.monthly-income-label')}</div>
					<input
						type="number"
						value={values.monthlyIncome}
						onFocus={actions.selectOnePercent}
						onChange={(e) => {
							const parsed = parseFloat(e.target.value);
							actions.setMonthlyIncome(isNaN(parsed) ? 0 : parsed);
						}}
						className="w-full bg-transparent text-lg leading-none font-medium text-inherit outline-hidden"
					/>
				</div>
				<button
					type="button"
					aria-pressed={values.onePercentSelected}
					onClick={actions.selectOnePercent}
					className={cn(
						'px-3 py-2 text-left transition-colors',
						values.onePercentSelected
							? 'bg-muted text-foreground'
							: 'text-muted-foreground hover:bg-muted/50 hover:text-foreground bg-white',
					)}
				>
					<div className="text-[10px] font-medium">{t('step1.your-one-percent')}</div>
					<div className="text-lg leading-none font-medium whitespace-nowrap">
						{currency} {values.onePercent}
					</div>
				</button>
			</div>

			<div className="mb-2 text-center text-[10px] font-medium">{t('step1.choose-own-amount')}</div>
			<div className="border-muted divide-muted mb-4 grid grid-cols-2 divide-y overflow-hidden rounded-xl border sm:grid-cols-4 sm:divide-x sm:divide-y-0">
				{amountOptions.map((option) => {
					const isSelected = option.value === values.selectedAmount;

					return (
						<button
							key={option.value}
							type="button"
							aria-pressed={isSelected}
							onClick={() => actions.setPresetAmount(option.value)}
							className={cn(
								'flex flex-col items-center justify-center p-2.5 leading-none font-medium transition-colors sm:p-3',
								isSelected ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
							)}
						>
							<span className={cn(option.labelKey === 'other' ? 'text-base' : 'text-[10px]')}>
								{option.labelKey === 'other' ? t('step1.other') : currency}
							</span>
							{option.value !== 'other' && <span>{option.value}</span>}
						</button>
					);
				})}
			</div>

			{values.selectedAmount === 'other' && (
				<input
					type="number"
					min={1}
					placeholder={t('step1.custom-amount-placeholder')}
					value={values.customAmount ?? ''}
					onChange={(e) => {
						const raw = e.target.value;
						if (raw === '') {
							actions.setPresetAmount('other');

							return;
						}
						const parsed = parseFloat(raw);
						if (!isNaN(parsed)) {
							actions.setCustomAmount(parsed);
						}
					}}
					className="border-input -mt-2 mb-4 w-full rounded-md border px-3 py-2 text-sm outline-hidden"
				/>
			)}

			<div className="bg-accent mb-4 grid grid-cols-2 rounded-md p-1">
				<button
					type="button"
					aria-pressed={values.cadence === 'monthly'}
					onClick={() => actions.setCadence('monthly')}
					className={cn(
						'cursor-pointer rounded-md px-3 py-2 text-sm font-semibold transition-colors',
						values.cadence === 'monthly'
							? cn(segmentActive, 'text-foreground')
							: 'text-muted-foreground hover:text-foreground',
					)}
				>
					{t('step1.monthly')}
				</button>
				<button
					type="button"
					aria-pressed={values.cadence === 'one-time'}
					onClick={() => actions.setCadence('one-time')}
					className={cn(
						'cursor-pointer rounded-md px-3 py-2 text-sm font-semibold transition-colors',
						values.cadence === 'one-time'
							? cn(segmentActive, 'text-foreground')
							: 'text-muted-foreground hover:text-foreground',
					)}
				>
					{t('step1.one-time')}
				</button>
			</div>

			<Button type="button" className="h-10 w-full text-sm font-semibold" disabled={!values.isValid} onClick={onSubmit}>
				{values.resolvedAmount !== null
					? t('step1.donate-now-with-amount', { amount: `${currency} ${values.resolvedAmount}` })
					: t('step1.donate-now')}
			</Button>
		</div>
	);
};

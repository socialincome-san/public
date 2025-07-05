'use client';

import { useTranslator } from '@/lib/hooks/useTranslator';
import { useI18n } from '@/lib/i18n/useI18n';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { FormControl, FormField, FormItem, FormMessage, RadioGroup, Typography } from '@socialincome/ui';
import classNames from 'classnames';
import { useFormContext } from 'react-hook-form';

export const DONATION_INTERVALS = ['1', '3', '12'] as const;
type DonationInterval = (typeof DONATION_INTERVALS)[number];

type DonationIntervalTranslations = {
	title: string;
	monthly: string;
	quarterly: string;
	yearly: string;
};

type DonationIntervalSelectorProps = {
	lang: WebsiteLanguage;
	translations: DonationIntervalTranslations;
	monthlyIncome: number;
};

function DonationIntervalFormItem({
	active,
	title,
	donationInterval,
	lang,
	monthlyIncome,
}: {
	active: boolean;
	title: string;
	donationInterval: DonationInterval;
	lang: WebsiteLanguage;
	monthlyIncome: number;
}) {
	const translator = useTranslator(lang, 'website-donate');
	const { currency } = useI18n();
	const { setValue } = useFormContext<{ donationInterval: DonationInterval }>();

	const getDonationAmount = (amount: number, donationInterval: DonationInterval) => {
		return Math.round(amount * 0.01 * Number(donationInterval));
	};

	const previewAmount = getDonationAmount(monthlyIncome, donationInterval);

	return (
		<FormItem>
			<FormControl
				className={classNames(
					'flex h-full flex-1 cursor-pointer flex-row rounded-lg border-2 p-4 shadow-sm focus:outline-none',
					{ 'border-accent bg-card-muted': active },
				)}
			>
				<div onClick={() => setValue('donationInterval', donationInterval)}>
					<div className="flex flex-1">
						<div className="flex flex-col space-y-1">
							<Typography weight="bold">{title}</Typography>
							<Typography size="sm">
								{translator?.t(`donation-interval.${donationInterval}.text`, {
									context: { amount: previewAmount, currency: currency, locale: lang },
								})}
							</Typography>
						</div>
					</div>
					<CheckCircleIcon
						className={classNames(!active ? 'invisible' : '', 'text-accent h-5 w-5')}
						aria-hidden="true"
					/>
				</div>
			</FormControl>
		</FormItem>
	);
}

export function DonationIntervalSelector({ lang, translations, monthlyIncome }: DonationIntervalSelectorProps) {
	const form = useFormContext();

	return (
		<div className="flex flex-col">
			<Typography size="lg" weight="medium" className="mb-4">
				{translations.title}
			</Typography>
			<FormField
				control={form.control}
				name="donationInterval"
				render={({ field }) => (
					<FormItem className="space-y-3">
						<FormControl>
							<RadioGroup
								onValueChange={field.onChange}
								defaultValue={field.value}
								className="grid grid-cols-1 place-items-stretch gap-4 md:grid-cols-3"
							>
								<DonationIntervalFormItem
									active={field.value === '1'}
									donationInterval="1"
									title={translations.monthly}
									lang={lang}
									monthlyIncome={monthlyIncome}
								/>
								<DonationIntervalFormItem
									active={field.value === '3'}
									donationInterval="3"
									title={translations.quarterly}
									lang={lang}
									monthlyIncome={monthlyIncome}
								/>
								<DonationIntervalFormItem
									active={field.value === '12'}
									donationInterval="12"
									title={translations.yearly}
									lang={lang}
									monthlyIncome={monthlyIncome}
								/>
							</RadioGroup>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		</div>
	);
}

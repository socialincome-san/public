'use client';

import { WebsiteLanguage } from '@/i18n';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { FormControl, FormField, FormItem, FormMessage, RadioGroup, Typography } from '@socialincome/ui';
import classNames from 'classnames';
import { ReactNode } from 'react';
import { useFormContext } from 'react-hook-form';
import { PaymentType, PaymentTypes } from '../one-time/generic-donation-form';

type PaymentTypeTranslations = {
	title: string;
	creditCard: string;
	bankTransfer: string;
	creditCardDescription: string;
	bankTransferDescription: string;
};

type PaymentTypeSelectorProps = {
	lang: WebsiteLanguage;
	translations: PaymentTypeTranslations;
	bankTransferForm: ReactNode;
	hasContent?: boolean;
};

function PaymentTypeFormItem({
	active,
	title,
	description,
	paymentType,
	hasContent,
}: {
	active: boolean;
	title: string;
	description: string;
	paymentType: PaymentType;
	hasContent?: boolean;
}) {
	const { setValue } = useFormContext();

	return (
		<FormItem>
			<FormControl
				className={classNames(
					'flex flex-1 cursor-pointer flex-row border-2 p-4 focus:outline-none',
					{ 'shadow-sm': !active },
					{ 'bg-blue-100': active && paymentType === PaymentTypes.BANK_TRANSFER },
					{ 'border-accent bg-card-muted': active && paymentType === PaymentTypes.CREDIT_CARD },
					{ 'rounded-lg': !hasContent },
					{ 'rounded-b-none rounded-t-lg border-b-0 pb-8': hasContent },
				)}
			>
				<div onClick={() => setValue('paymentType', paymentType)}>
					<div className="flex flex-1">
						<div className="flex flex-col space-y-1">
							<Typography weight="bold">{title}</Typography>
							<Typography size="sm">{description}</Typography>
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

export function PaymentTypeSelector({ lang, translations, bankTransferForm }: PaymentTypeSelectorProps) {
	const form = useFormContext();

	return (
		<div className="flex flex-col">
			<Typography size="lg" weight="medium" className="mb-4">
				{translations.title}
			</Typography>
			<FormField
				control={form.control}
				name="paymentType"
				render={({ field }) => {
					const isActive = field.value === 'bank_transfer';

					return (
						<FormItem className="space-y-3">
							<FormControl>
								<RadioGroup
									onValueChange={field.onChange}
									defaultValue={field.value}
									className="grid grid-cols-1 place-items-stretch gap-4 md:grid-cols-2"
								>
									<PaymentTypeFormItem
										active={field.value === PaymentTypes.CREDIT_CARD}
										paymentType={PaymentTypes.CREDIT_CARD}
										title={translations.creditCard}
										description={translations.creditCardDescription}
									/>
									<PaymentTypeFormItem
										active={isActive}
										paymentType={PaymentTypes.BANK_TRANSFER}
										title={translations.bankTransfer}
										description={translations.bankTransferDescription}
										hasContent={isActive}
									/>
								</RadioGroup>
							</FormControl>
							<FormMessage />
							{field.value === 'bank_transfer' && bankTransferForm}
						</FormItem>
					);
				}}
			/>
		</div>
	);
}

'use client';

import { WebsiteLanguage } from '@/i18n';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage, RadioGroup, Typography } from '@socialincome/ui';
import classNames from 'classnames';
import { useForm, useFormContext } from 'react-hook-form';
import * as z from 'zod';

export const PAYMENT_TYPES = ['credit_card', 'bank_transfer'] as const;
type PaymentType = (typeof PAYMENT_TYPES)[number];

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
};

function PaymentTypeFormItem({
	active,
	title,
	description,
	paymentType,
}: {
	active: boolean;
	title: string;
	description: string;
	paymentType: PaymentType;
}) {
	const { setValue } = useFormContext<{ paymentType: PaymentType }>();

	return (
		<FormItem>
			<FormControl
				className={classNames(
					'flex h-full flex-1 cursor-pointer flex-row rounded-lg border-2 p-4 shadow-sm focus:outline-none',
					{ 'border-accent bg-card-muted': active },
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

export function PaymentTypeSelector({ lang, translations }: PaymentTypeSelectorProps) {
	const formSchema = z.object({
		paymentType: z.enum(PAYMENT_TYPES),
	});
	type FormSchema = z.infer<typeof formSchema>;

	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: { paymentType: 'credit_card' },
	});

	return (
		<Form {...form}>
			<form className="flex flex-col space-y-8">
				<Typography size="lg" weight="medium" className="mb-4">
					{translations.title}
				</Typography>
				<FormField
					control={form.control}
					name="paymentType"
					render={({ field }) => (
						<FormItem className="space-y-3">
							<FormControl>
								<RadioGroup
									onValueChange={field.onChange}
									defaultValue={field.value}
									className="grid grid-cols-1 place-items-stretch gap-4 md:grid-cols-2"
								>
									<PaymentTypeFormItem
										active={field.value === 'credit_card'}
										paymentType="credit_card"
										title={translations.creditCard}
										description={translations.creditCardDescription}
									/>
									<PaymentTypeFormItem
										active={field.value === 'bank_transfer'}
										paymentType="bank_transfer"
										title={translations.bankTransfer}
										description={translations.bankTransferDescription}
									/>
								</RadioGroup>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</form>
		</Form>
	);
}

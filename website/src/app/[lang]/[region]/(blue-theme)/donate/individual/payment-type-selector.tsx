'use client';

import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { FormItem, RadioGroup, Typography } from '@socialincome/ui';
import classNames from 'classnames';

export const PAYMENT_TYPES = ['credit_card', 'bank_transfer'] as const;
export type PaymentType = (typeof PAYMENT_TYPES)[number];

type PaymentTypeTranslations = {
	title: string;
	creditCard: string;
	bankTransfer: string;
	creditCardDescription: string;
	bankTransferDescription: string;
};

type PaymentTypeSelectorProps = {
	translations: PaymentTypeTranslations;
	hasContent?: boolean;
	onSelect: (paymentType: PaymentType) => void;
	value: PaymentType;
};

export function PaymentTypeSelector({ translations, onSelect, value }: PaymentTypeSelectorProps) {
	return (
		<div className="flex flex-col">
			<Typography size="lg" weight="medium" className="mb-4">
				{translations.title}
			</Typography>
			<FormItem className="space-y-3">
				<RadioGroup
					onValueChange={onSelect}
					defaultValue={value}
					className="grid grid-cols-1 place-items-stretch gap-4 md:grid-cols-2"
				>
					<PaymentTypeFormItem
						onClick={() => onSelect('credit_card')}
						active={value === 'credit_card'}
						paymentType="credit_card"
						title={translations.creditCard}
						description={translations.creditCardDescription}
					/>
					<PaymentTypeFormItem
						onClick={() => onSelect('bank_transfer')}
						active={value === 'bank_transfer'}
						paymentType="bank_transfer"
						title={translations.bankTransfer}
						description={translations.bankTransferDescription}
						hasContent={value === 'bank_transfer'}
					/>
				</RadioGroup>
			</FormItem>
		</div>
	);
}

type PaymentTypeFormItemProps = {
	active: boolean;
	title: string;
	description: string;
	paymentType: PaymentType;
	hasContent?: boolean;
	onClick: (paymentType: PaymentType) => void;
};

function PaymentTypeFormItem({
	active,
	title,
	description,
	paymentType,
	hasContent,
	onClick,
}: PaymentTypeFormItemProps) {
	return (
		<div
			className={classNames(
				'flex flex-1 cursor-pointer flex-row border-2 p-4 focus:outline-none',
				{ 'shadow-sm': !active },
				{ 'border-accent bg-card-muted': active },
				{ 'rounded-lg': !hasContent },
				{ 'rounded-b-none rounded-t-lg border-b-0 pb-8': hasContent },
			)}
			onClick={() => onClick(paymentType)}
		>
			<div className="flex flex-1">
				<div className="flex flex-col space-y-1">
					<Typography weight="bold">{title}</Typography>
					<Typography size="sm">{description}</Typography>
				</div>
			</div>
			<CheckCircleIcon className={classNames(!active ? 'invisible' : '', 'text-accent h-5 w-5')} aria-hidden="true" />
		</div>
	);
}

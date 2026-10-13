'use client';

import { IndirectImpactNotice } from '@/components/create-program-wizard/step-3/indirect-impact-notice';
import { QuantitySelector } from '@socialincome/design-system/forms/quantity-selector/quantity-selector';
import { useTranslations } from 'next-intl';

type Props = {
	title: string;
	amountOfRecipients: number;
	filteredRecipients: number;
	disabled?: boolean;
	onChange: (value: number) => void;
};

export const RecipientsBox = ({ title, amountOfRecipients, filteredRecipients, disabled = false, onChange }: Props) => {
	const t = useTranslations('create-program-wizard');
	const noCandidates = filteredRecipients === 0;

	return (
		<div className="flex h-full flex-col overflow-hidden rounded-xl border">
			<div className="p-8">
				<QuantitySelector
					label={title}
					value={noCandidates ? 0 : amountOfRecipients}
					min={1}
					max={filteredRecipients}
					disabled={disabled}
					onChange={onChange}
					atMaxHint={t('step3.recipients.max_hint')}
					emptyMessage={t('step3.recipients.no_candidates')}
					name="amountOfRecipients"
					inputTestId="recipients-count-input"
					sliderTestId="recipients-slider"
				/>
			</div>

			<div className="mt-auto">
				<IndirectImpactNotice recipients={noCandidates ? 0 : amountOfRecipients} />
			</div>
		</div>
	);
};

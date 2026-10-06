'use client';

import { Button } from '@socialincome/design-system/button/button';
import type { ComponentProps } from 'react';
import { useDonationModal } from '../hooks/use-donation-modal';

type Props = {
	label: string;
	onBeforeOpen?: () => void;
} & Pick<ComponentProps<typeof Button>, 'size' | 'fullWidth'>;

export const OpenDonationWizardButton = ({ label, size, fullWidth, onBeforeOpen }: Props) => {
	const { openWizardAtAmountStep } = useDonationModal();

	return (
		<Button
			type="button"
			data-testid="donation-wizard-trigger"
			aria-haspopup="dialog"
			size={size}
			fullWidth={fullWidth}
			onClick={() => {
				onBeforeOpen?.();
				openWizardAtAmountStep();
			}}
		>
			{label}
		</Button>
	);
};

'use client';

import { Button } from '@/components/button';
import { useDonationModal } from '../hooks/use-donation-modal';

type Props = {
	label: string;
	className?: string;
	onBeforeOpen?: () => void;
};

export const OpenDonationWizardButton = ({ label, className, onBeforeOpen }: Props) => {
	const { openWizardAtAmountStep } = useDonationModal();

	return (
		<Button
			type="button"
			data-testid="donation-wizard-trigger"
			aria-haspopup="dialog"
			className={className}
			onClick={() => {
				onBeforeOpen?.();
				openWizardAtAmountStep();
			}}
		>
			{label}
		</Button>
	);
};

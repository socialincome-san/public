'use client';

import { trackEvent } from '@/lib/analytics/analytics';
import { Button } from '@socialincome/design-system/actions/button/button';
import type { ComponentProps } from 'react';
import { useDonationModal } from '../hooks/use-donation-modal';

type Props = {
	label: string;
	onBeforeOpen?: () => void;
	analyticsEvent?: string;
} & Pick<ComponentProps<typeof Button>, 'variant' | 'size' | 'fullWidth'>;

export const OpenDonationWizardButton = ({ label, variant, size, fullWidth, onBeforeOpen, analyticsEvent }: Props) => {
	const { openWizardAtAmountStep } = useDonationModal();

	return (
		<Button
			type="button"
			data-testid="donation-wizard-trigger"
			aria-haspopup="dialog"
			variant={variant}
			size={size}
			fullWidth={fullWidth}
			onClick={() => {
				if (analyticsEvent) {
					trackEvent(analyticsEvent);
				}
				onBeforeOpen?.();
				openWizardAtAmountStep();
			}}
		>
			{label}
		</Button>
	);
};

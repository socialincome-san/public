'use client';

import { DonationForm } from '@/components/donation-wizard/embedded-form/donation-form';
import { useDonationModal } from '@/components/donation-wizard/hooks/use-donation-modal';

type Props = {
	campaignId?: string;
};

export const MakeDonationForm = ({ campaignId }: Props) => {
	const { openDonationWizardFromForm } = useDonationModal();

	return (
		<DonationForm onDonate={(context) => openDonationWizardFromForm(campaignId ? { ...context, campaignId } : context)} />
	);
};

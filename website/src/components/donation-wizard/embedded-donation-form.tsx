'use client';

import { DonationForm } from './donation-form/donation-form';
import { useDonationModal } from './donation-modal-provider';

type Props = {
	showTitle?: boolean;
	className?: string;
};

export const EmbeddedDonationForm = ({ showTitle, className }: Props) => {
	const { openDonationWizardFromForm } = useDonationModal();

	return (
		<DonationForm showTitle={showTitle} className={className} onDonate={(context) => openDonationWizardFromForm(context)} />
	);
};

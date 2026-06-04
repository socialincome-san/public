'use client';

import { DonationForm } from './embedded-form/donation-form';
import { useDonationModal } from './hooks/use-donation-modal';

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

'use client';

import { cn } from '@/lib/utils/cn';
import { type KeyboardEvent, type ReactNode } from 'react';
import { useDonationModal } from './donation-modal-provider';

type Props = {
	children: ReactNode;
	className?: string;
	onBeforeOpen?: () => void;
};

export const DonateNowTrigger = ({ children, className, onBeforeOpen }: Props) => {
	const { openDonationWizard } = useDonationModal();

	const handleOpen = () => {
		onBeforeOpen?.();
		openDonationWizard();
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleOpen();
		}
	};

	return (
		<div
			data-testid="donation-wizard-trigger"
			role="button"
			tabIndex={0}
			aria-haspopup="dialog"
			className={cn(className)}
			onClick={handleOpen}
			onKeyDown={handleKeyDown}
		>
			{children}
		</div>
	);
};

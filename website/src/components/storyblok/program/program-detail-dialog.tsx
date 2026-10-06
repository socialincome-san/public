'use client';

import { ProgramDetailPill } from '@/components/storyblok/program/program-detail-pill';
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from '@socialincome/design-system/dialog/dialog';
import { type ReactNode, useState } from 'react';

type Props = {
	title: string;
	triggerLabel: string;
	headerActions?: ReactNode;
	closeAriaLabel?: string;
	onOpenChange?: (open: boolean) => void;
	children: ReactNode;
};

export const ProgramDetailDialog = ({
	title,
	triggerLabel,
	headerActions,
	closeAriaLabel = 'Close',
	onOpenChange,
	children,
}: Props) => {
	const [isOpen, setIsOpen] = useState(false);

	const handleOpenChange = (open: boolean) => {
		setIsOpen(open);
		onOpenChange?.(open);
	};

	return (
		<>
			<ProgramDetailPill label={triggerLabel} isOpen={isOpen} onClick={() => handleOpenChange(true)} />

			<Dialog open={isOpen} onOpenChange={handleOpenChange}>
				<DialogContent size="full" closeLabel={closeAriaLabel}>
					<DialogHeader>
						<div className="flex items-start justify-between gap-4">
							<DialogTitle size="lg">{title}</DialogTitle>
							{headerActions ? (
								<div className="flex flex-col-reverse items-end gap-2 sm:flex-row sm:items-center">{headerActions}</div>
							) : null}
						</div>
					</DialogHeader>

					<DialogBody>
						<div className="flex flex-col gap-8">{children}</div>
					</DialogBody>
				</DialogContent>
			</Dialog>
		</>
	);
};

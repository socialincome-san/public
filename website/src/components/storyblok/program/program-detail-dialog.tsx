'use client';

import { LinkPill } from '@socialincome/design-system/actions/link-pill/link-pill';
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@socialincome/design-system/overlays/dialog/dialog';
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
			<LinkPill label={triggerLabel} isOpen={isOpen} onClick={() => handleOpenChange(true)} />

			<Dialog open={isOpen} onOpenChange={handleOpenChange}>
				<DialogContent size="lg" closeLabel={closeAriaLabel}>
					<DialogHeader>
						{/* On mobile the actions drop below the title, so they never run under the close button */}
						<div className="flex flex-col items-start gap-3 sm:flex-row sm:justify-between sm:gap-4">
							<div className="pr-8 sm:pr-0">
								<DialogTitle size="lg">{title}</DialogTitle>
							</div>
							{headerActions ? (
								<div className="flex flex-wrap items-center gap-2 sm:mr-4 sm:shrink-0">{headerActions}</div>
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

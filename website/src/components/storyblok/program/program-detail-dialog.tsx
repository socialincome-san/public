'use client';

import { Button } from '@/components/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { ProgramDetailPill } from '@/components/storyblok/program/program-detail-pill';
import { cn } from '@/lib/utils/cn';
import { X } from 'lucide-react';
import { type ReactNode, useState } from 'react';

type Props = {
	title: string;
	triggerLabel: string;
	headerActions?: ReactNode;
	bodyClassName?: string;
	closeAriaLabel?: string;
	onOpenChange?: (open: boolean) => void;
	children: ReactNode;
};

export const ProgramDetailDialog = ({
	title,
	triggerLabel,
	headerActions,
	bodyClassName,
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
				<DialogContent
					variant="large"
					hideCloseButton
					className="w-site-width flex max-h-[85vh] max-w-none flex-col gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-none"
				>
					<DialogHeader className="border-border bg-background sticky top-0 z-10 mx-0 flex shrink-0 items-start gap-4 space-y-0 rounded-t-3xl border-b p-4 lg:p-6">
						<DialogTitle className="mt-2 min-w-0 text-2xl leading-none font-medium">{title}</DialogTitle>
						<div className="ml-auto flex flex-col-reverse items-end gap-2 sm:flex-row sm:items-center">
							{headerActions}
							<Button
								type="button"
								size="icon"
								variant="ghost"
								className="size-8 shrink-0 rounded-full"
								onClick={() => handleOpenChange(false)}
								aria-label={closeAriaLabel}
							>
								<X aria-hidden="true" />
							</Button>
						</div>
					</DialogHeader>

					<div className={cn('overflow-y-auto p-4 lg:p-6', bodyClassName)}>{children}</div>
				</DialogContent>
			</Dialog>
		</>
	);
};

'use client';

import { Button } from '@/components/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { ProgramDetailPill } from '@/components/storyblok/program/program-detail-pill';
import { ProgramRecipientsTable } from '@/components/storyblok/program/program-recipients-table';
import type { PublicRecipientTableViewRow } from '@/lib/services/recipient/recipient.types';
import { X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

type Props = {
	dialogTitle: string;
	viewDemographicsLabel: string;
	manageLabel: string;
	manageHref: string;
	rows: PublicRecipientTableViewRow[];
	totalCount: number;
};

export const ProgramRecipientsDialog = ({
	dialogTitle,
	viewDemographicsLabel,
	manageLabel,
	manageHref,
	rows,
	totalCount,
}: Props) => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<ProgramDetailPill label={viewDemographicsLabel} isOpen={isOpen} onClick={() => setIsOpen(true)} />

			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogContent
					variant="large"
					hideCloseButton
					className="w-site-width flex max-h-[85vh] max-w-none flex-col gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-none"
				>
					<DialogHeader className="border-border bg-background sticky top-0 z-10 mx-0 flex shrink-0 flex-row items-center justify-between gap-4 space-y-0 rounded-t-3xl border-b px-12 py-6">
						<DialogTitle className="text-2xl leading-none font-medium">{dialogTitle}</DialogTitle>
						<div className="flex items-center gap-2">
							<Button asChild size="sm" variant="outline">
								<Link href={manageHref}>{manageLabel}</Link>
							</Button>
							<Button
								type="button"
								size="icon"
								variant="ghost"
								className="size-8 rounded-full"
								onClick={() => setIsOpen(false)}
								aria-label="Close"
							>
								<X aria-hidden="true" />
							</Button>
						</div>
					</DialogHeader>

					<div className="min-w-0 overflow-y-auto px-12 pt-8 pb-12">
						<ProgramRecipientsTable rows={rows} totalCount={totalCount} />
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
};

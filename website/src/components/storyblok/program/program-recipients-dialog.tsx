'use client';

import { Button } from '@/components/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { ProgramDetailPill } from '@/components/storyblok/program/program-detail-pill';
import { ProgramRecipientsTable } from '@/components/storyblok/program/program-recipients-table';
import { getPublicRecipientsTableAction } from '@/lib/server-actions/program-detail-public-actions';
import type { PublicRecipientTableViewRow } from '@/lib/services/recipient/recipient.types';
import { X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type Props = {
	dialogTitle: string;
	viewDemographicsLabel: string;
	manageLabel: string;
	manageHref: string;
	programId: string;
};

export const ProgramRecipientsDialog = ({
	dialogTitle,
	viewDemographicsLabel,
	manageLabel,
	manageHref,
	programId,
}: Props) => {
	const [isOpen, setIsOpen] = useState(false);
	const [rows, setRows] = useState<PublicRecipientTableViewRow[] | null>(null);
	const [totalCount, setTotalCount] = useState<number | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!isOpen || rows !== null || isLoading) {
			return;
		}

		let isCancelled = false;

		const loadRecipients = async () => {
			setIsLoading(true);
			setError(null);

			const result = await getPublicRecipientsTableAction(programId);

			if (isCancelled) {
				return;
			}

			setIsLoading(false);

			if (!result.success) {
				setError(result.error);

				return;
			}

			setRows(result.data.tableRows);
			setTotalCount(result.data.totalCount);
		};

		void loadRecipients();

		return () => {
			isCancelled = true;
		};
	}, [isOpen, isLoading, programId, rows]);

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
						{isLoading ? (
							<p className="text-muted-foreground text-sm">Loading...</p>
						) : error ? (
							<div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-900">
								<p className="font-medium">Could not load recipients.</p>
								<p className="mt-1 text-sm">{error}</p>
							</div>
						) : rows && totalCount !== null ? (
							<ProgramRecipientsTable rows={rows} totalCount={totalCount} />
						) : null}
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
};

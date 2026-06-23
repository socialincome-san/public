'use client';

import { Button } from '@/components/button';
import { ProgramDetailDialog } from '@/components/storyblok/program/program-detail-dialog';
import { ProgramRecipientsTable } from '@/components/storyblok/program/program-recipients-table';
import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import { getPublicRecipientsTableAction } from '@/lib/server-actions/program-detail-public-actions';
import type { PublicRecipientTableViewRow } from '@/lib/services/recipient/recipient.types';
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
	const { t } = useRouteTranslator({ namespace: 'website-common' });
	const [isOpen, setIsOpen] = useState(false);
	const [rows, setRows] = useState<PublicRecipientTableViewRow[] | null>(null);
	const [totalCount, setTotalCount] = useState<number | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [hasError, setHasError] = useState(false);
	const [retryKey, setRetryKey] = useState(0);

	useEffect(() => {
		if (!isOpen || rows !== null) {
			return;
		}

		let isCancelled = false;

		const loadRecipients = async () => {
			setIsLoading(true);
			setHasError(false);

			try {
				const result = await getPublicRecipientsTableAction(programId);

				if (isCancelled) {
					return;
				}

				if (!result.success) {
					setHasError(true);

					return;
				}

				setRows(result.data.tableRows);
				setTotalCount(result.data.totalCount);
			} catch {
				if (!isCancelled) {
					setHasError(true);
				}
			} finally {
				setIsLoading(false);
			}
		};

		void loadRecipients();

		return () => {
			isCancelled = true;
		};
	}, [isOpen, programId, rows, retryKey]);

	return (
		<ProgramDetailDialog
			title={dialogTitle}
			triggerLabel={viewDemographicsLabel}
			closeAriaLabel={t('program-detail-page.close')}
			bodyClassName="min-w-0"
			onOpenChange={setIsOpen}
			headerActions={
				<Button asChild size="sm" variant="outline">
					<Link href={manageHref}>{manageLabel}</Link>
				</Button>
			}
		>
			{isLoading ? (
				<p className="text-muted-foreground text-sm" role="status" aria-live="polite">
					{t('program-detail-page.loading')}
				</p>
			) : hasError ? (
				<div className="text-destructive border-destructive/20 bg-destructive-foreground flex flex-col gap-4 rounded-md border p-4">
					<p className="font-medium">{t('program-detail-page.load-recipients-error')}</p>
					<Button
						type="button"
						variant="outline"
						className="text-destructive border-destructive/30 bg-card hover:bg-destructive-foreground self-start"
						onClick={() => {
							setHasError(false);
							setRetryKey((current) => current + 1);
						}}
					>
						{t('program-detail-page.try-again')}
					</Button>
				</div>
			) : rows && totalCount !== null ? (
				<ProgramRecipientsTable rows={rows} totalCount={totalCount} />
			) : null}
		</ProgramDetailDialog>
	);
};

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

			const result = await getPublicRecipientsTableAction(programId);

			if (isCancelled) {
				return;
			}

			setIsLoading(false);

			if (!result.success) {
				setHasError(true);

				return;
			}

			setRows(result.data.tableRows);
			setTotalCount(result.data.totalCount);
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
				<p className="text-muted-foreground text-sm">{t('program-detail-page.loading')}</p>
			) : hasError ? (
				<div className="flex flex-col gap-4 rounded-md border border-red-200 bg-red-50 p-4 text-red-900">
					<p className="font-medium">{t('program-detail-page.load-recipients-error')}</p>
					<Button
						type="button"
						variant="outline"
						className="self-start border-red-300 bg-white text-red-900 hover:bg-red-100"
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

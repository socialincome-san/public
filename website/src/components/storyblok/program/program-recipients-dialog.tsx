'use client';

import { Button } from '@/components/button';
import { ProgramDetailDialog } from '@/components/storyblok/program/program-detail-dialog';
import { ProgramRecipientsTable } from '@/components/storyblok/program/program-recipients-table';
import { getPublicRecipientsTableAction } from '@/lib/server-actions/program-detail-public-actions';
import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
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
			) : error ? (
				<div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-900">
					<p className="font-medium">{t('program-detail-page.load-recipients-error')}</p>
					<p className="mt-1 text-sm">{error}</p>
				</div>
			) : rows && totalCount !== null ? (
				<ProgramRecipientsTable rows={rows} totalCount={totalCount} />
			) : null}
		</ProgramDetailDialog>
	);
};

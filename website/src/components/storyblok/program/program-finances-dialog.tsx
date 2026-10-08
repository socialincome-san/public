'use client';

import { ProgramDetailDialog } from '@/components/storyblok/program/program-detail-dialog';
import { ProgramPayoutForecastTable } from '@/components/storyblok/program/program-payout-forecast-table';
import { getPublicPayoutForecastTableAction } from '@/modules/payouts/payout.actions';
import type { PayoutForecastTableViewRow } from '@/modules/payouts/payout.types';
import { Button } from '@socialincome/design-system/actions/button/button';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { type ReactNode, useEffect, useState } from 'react';

type Props = {
	dialogTitle: string;
	viewBreakdownLabel: string;
	manageLabel: string;
	manageHref: string;
	payoutForecastInfoTooltip: string;
	financesCard: ReactNode;
	programId: string;
};

export const ProgramFinancesDialog = ({
	dialogTitle,
	viewBreakdownLabel,
	manageLabel,
	manageHref,
	payoutForecastInfoTooltip,
	financesCard,
	programId,
}: Props) => {
	const t = useTranslations('website-common');
	const [isOpen, setIsOpen] = useState(false);
	const [rows, setRows] = useState<PayoutForecastTableViewRow[] | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [hasError, setHasError] = useState(false);
	const [retryKey, setRetryKey] = useState(0);

	useEffect(() => {
		if (!isOpen || rows !== null) {
			return;
		}

		let isCancelled = false;

		const loadForecast = async () => {
			setIsLoading(true);
			setHasError(false);

			const result = await getPublicPayoutForecastTableAction(programId);

			if (isCancelled) {
				setIsLoading(false);

				return;
			}

			setIsLoading(false);

			if (!result.success) {
				setHasError(true);

				return;
			}

			setRows(result.data.tableRows);
		};

		void loadForecast();

		return () => {
			isCancelled = true;
		};
	}, [isOpen, programId, rows, retryKey]);

	return (
		<ProgramDetailDialog
			title={dialogTitle}
			triggerLabel={viewBreakdownLabel}
			closeAriaLabel={t('program-detail-page.close')}
			onOpenChange={setIsOpen}
			headerActions={
				<Button asChild size="sm" variant="outline">
					<Link href={manageHref}>{manageLabel}</Link>
				</Button>
			}
		>
			{financesCard}
			{isLoading ? (
				<p className="text-muted-foreground text-sm" role="status" aria-live="polite">
					{t('program-detail-page.loading')}
				</p>
			) : hasError ? (
				<div className="text-destructive border-destructive/20 bg-destructive-foreground flex flex-col gap-4 rounded-md border p-4">
					<p className="font-medium">{t('program-detail-page.load-payout-forecast-error')}</p>
					<div>
						<Button
							type="button"
							variant="destructive-outline"
							onClick={() => {
								setHasError(false);
								setRetryKey((current) => current + 1);
							}}
						>
							{t('program-detail-page.try-again')}
						</Button>
					</div>
				</div>
			) : rows ? (
				<ProgramPayoutForecastTable rows={rows} titleInfoTooltip={payoutForecastInfoTooltip} />
			) : null}
		</ProgramDetailDialog>
	);
};

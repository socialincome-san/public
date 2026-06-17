'use client';

import { Button } from '@/components/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { ProgramDetailPill } from '@/components/storyblok/program/program-detail-pill';
import { ProgramPayoutForecastTable } from '@/components/storyblok/program/program-payout-forecast-table';
import { getPublicPayoutForecastTableAction } from '@/lib/server-actions/program-detail-public-actions';
import type { PayoutForecastTableViewRow } from '@/lib/services/payout/payout.types';
import { X } from 'lucide-react';
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
	const [isOpen, setIsOpen] = useState(false);
	const [rows, setRows] = useState<PayoutForecastTableViewRow[] | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!isOpen || rows !== null) {
			return;
		}

		let isCancelled = false;

		const loadForecast = async () => {
			setIsLoading(true);
			setError(null);

			const result = await getPublicPayoutForecastTableAction(programId);

			if (isCancelled) {
				return;
			}

			setIsLoading(false);

			if (!result.success) {
				setError(result.error);

				return;
			}

			setRows(result.data.tableRows);
		};

		void loadForecast();

		return () => {
			isCancelled = true;
		};
	}, [isOpen, programId, rows]);

	return (
		<>
			<ProgramDetailPill label={viewBreakdownLabel} isOpen={isOpen} onClick={() => setIsOpen(true)} />

			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogContent
					hideCloseButton
					className="flex max-h-[85vh] flex-col gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-2xl"
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

					<div className="flex flex-col gap-8 overflow-y-auto px-12 pt-8 pb-12">
						{financesCard}
						{isLoading ? (
							<p className="text-muted-foreground text-sm">Loading...</p>
						) : error ? (
							<div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-900">
								<p className="font-medium">Could not load payout forecast.</p>
								<p className="mt-1 text-sm">{error}</p>
							</div>
						) : rows ? (
							<ProgramPayoutForecastTable rows={rows} titleInfoTooltip={payoutForecastInfoTooltip} />
						) : null}
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
};

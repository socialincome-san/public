'use client';

import { DateSelectionSection } from '@/app/portal/(routes)/(protected)/delivery/make-payouts/date-selection-section';
import { DialogActionSection } from '@/app/portal/(routes)/(protected)/delivery/make-payouts/dialog-action-section';
import { Alert, AlertDescription, AlertTitle } from '@/app/portal/components/alert';
import { Button } from '@/app/portal/components/button';
import { makePayoutColumns } from '@/app/portal/components/data-table/columns/payouts';
import DataTable from '@/app/portal/components/data-table/data-table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/app/portal/components/dialog';
import {
	downloadPayoutCsvAction,
	downloadRegistrationCsvAction,
	generatePayoutsAction,
} from '@/app/portal/server-actions/payout-actions';
import type { PayoutTableViewRow } from '@socialincome/shared/src/database/services/payout/payout.types';
import { format } from 'date-fns';
import { CheckCircleIcon, DownloadIcon, PlayIcon, XCircleIcon } from 'lucide-react';
import { useState, useTransition } from 'react';

export function PayoutsTableClient({ rows, error }: { rows: PayoutTableViewRow[]; error: string | null }) {
	const [open, setOpen] = useState(false);
	const [selectedDate, setSelectedDate] = useState<Date>(new Date());
	const [isPending, startTransition] = useTransition();
	const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

	const getMonthFileLabel = () => format(selectedDate, 'yyyy-MM');

	async function handleCsvDownload(csv: string, filename: string) {
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = filename;
		link.click();
		URL.revokeObjectURL(url);
	}

	const handleAction = async (fn: () => Promise<void>) => {
		setMessage(null);
		try {
			await fn();
			setMessage({ type: 'success', text: 'Action completed successfully.' });
		} catch (e) {
			console.error(e);
			setMessage({
				type: 'error',
				text: e instanceof Error ? e.message : 'Something went wrong.',
			});
		}
	};

	async function handleDownloadRegistrationCSV() {
		startTransition(() =>
			handleAction(async () => {
				const csv = await downloadRegistrationCsvAction();
				await handleCsvDownload(csv, `registration-${getMonthFileLabel()}.csv`);
			}),
		);
	}

	async function handleDownloadPayoutCSV() {
		startTransition(() =>
			handleAction(async () => {
				const csv = await downloadPayoutCsvAction(selectedDate);
				await handleCsvDownload(csv, `payouts-${getMonthFileLabel()}.csv`);
			}),
		);
	}

	async function handleGeneratePayouts() {
		startTransition(() =>
			handleAction(async () => {
				await generatePayoutsAction(selectedDate);
			}),
		);
	}

	return (
		<>
			<DataTable
				title="Payouts"
				error={error}
				emptyMessage="No payouts found"
				data={rows}
				makeColumns={makePayoutColumns}
				actions={<Button onClick={() => setOpen(true)}>Start payout process</Button>}
			/>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="sm:max-w-[520px]">
					<DialogHeader>
						<DialogTitle>Start payout process</DialogTitle>
					</DialogHeader>

					<div className="flex flex-col gap-5">
						{message && (
							<Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
								{message.type === 'error' ? (
									<XCircleIcon className="mt-0.5 h-4 w-4" />
								) : (
									<CheckCircleIcon className="mt-0.5 h-4 w-4 text-green-600" />
								)}
								<AlertTitle>{message.type === 'error' ? 'Error' : 'Success'}</AlertTitle>
								<AlertDescription>{message.text}</AlertDescription>
							</Alert>
						)}

						<DialogActionSection
							label="Download registration CSV"
							description="Generates a list of all recipients. This does not depend on a specific payout month."
							onClick={handleDownloadRegistrationCSV}
							icon={<DownloadIcon className="h-4 w-4" />}
							isPending={isPending}
						/>

						<div className="border-border bg-muted/40 flex flex-col gap-4 rounded-xl border p-4">
							<DateSelectionSection
								label="Select payout month"
								description="The selected month determines which recipients and payouts will be processed below."
								selected={selectedDate}
								onSelect={(date) => date && setSelectedDate(date)}
								disabled={isPending}
							/>

							<div className="grid grid-cols-2 gap-3">
								<DialogActionSection
									label="Download payout CSV"
									description="Prepares the payout file for all active recipients for the selected month."
									onClick={handleDownloadPayoutCSV}
									icon={<DownloadIcon className="h-4 w-4" />}
									isPending={isPending}
								/>

								<DialogActionSection
									label="Generate payouts"
									description="Creates and updates payout entries in the database for this payout cycle."
									onClick={handleGeneratePayouts}
									icon={<PlayIcon className="h-4 w-4" />}
									isPending={isPending}
									variant="default"
								/>
							</div>
						</div>
					</div>

					<DialogFooter className="mt-4 flex justify-end">
						<Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
							Cancel
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}

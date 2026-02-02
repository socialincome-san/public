'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/alert';
import { Button } from '@/components/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { SuccessBanner } from '@/components/success-banner';
import { importRecipientsCsvAction } from '@/lib/server-actions/recipient-actions';
import { CsvRow, parseCsvFile } from '@/lib/utils/csv';
import { useState } from 'react';
import { CsvDropzone } from './csv-dropzone';
import { CsvPreviewTable } from './csv-preview-table';
import { CsvTemplateDownload } from './csv-template-download';

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

type ImportResult = { type: 'success'; created: number } | { type: 'error'; message: string } | null;

export function CsvUploadDialog({ open, onOpenChange }: Props) {
	const [file, setFile] = useState<File | null>(null);
	const [previewRows, setPreviewRows] = useState<CsvRow[] | null>(null);
	const [isImporting, setIsImporting] = useState(false);
	const [result, setResult] = useState<ImportResult>(null);

	const resetState = () => {
		setFile(null);
		setPreviewRows(null);
		setIsImporting(false);
		setResult(null);
	};

	const handleDialogClose = () => {
		resetState();
		onOpenChange(false);
	};

	const handleFileSelected = async (selectedFile: File) => {
		try {
			const rows = await parseCsvFile(selectedFile);

			setFile(selectedFile);
			setPreviewRows(rows);
			setResult(null);
		} catch (error) {
			setFile(null);
			setPreviewRows(null);
			setResult({
				type: 'error',
				message: error instanceof Error ? error.message : 'Failed to parse CSV file.',
			});
		}
	};

	const handleImport = async () => {
		if (!file) {
			return;
		}

		setIsImporting(true);
		setResult(null);

		const response = await importRecipientsCsvAction(file);

		setIsImporting(false);

		if (!response.success) {
			setResult({
				type: 'error',
				message: response.error ?? 'Failed to import recipients.',
			});
			return;
		}

		setResult({
			type: 'success',
			created: response.data.created,
		});
	};

	const hasPreview = previewRows && previewRows.length > 0;
	const isSuccess = result?.type === 'success';

	return (
		<Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && handleDialogClose()}>
			<DialogContent className="space-y-4 sm:max-w-3xl">
				<DialogHeader>
					<DialogTitle>Upload recipients CSV</DialogTitle>
				</DialogHeader>

				<CsvTemplateDownload />

				{!isSuccess && <CsvDropzone onFileSelected={handleFileSelected} />}

				{result?.type === 'error' && (
					<Alert variant="destructive">
						<AlertTitle>Import failed</AlertTitle>
						<AlertDescription>{result.message}</AlertDescription>
					</Alert>
				)}

				{result?.type === 'success' && (
					<SuccessBanner
						title="Import completed"
						description={`Successfully imported ${result.created} recipient${result.created === 1 ? '' : 's'}.`}
					/>
				)}

				{hasPreview && !isSuccess && <CsvPreviewTable rows={previewRows} />}

				<div className="flex justify-end gap-2">
					<Button variant="outline" onClick={handleDialogClose} disabled={isImporting}>
						{isSuccess ? 'Close' : 'Cancel'}
					</Button>

					{hasPreview && !isSuccess && (
						<Button data-testid="import-recipients-button" onClick={handleImport} disabled={isImporting}>
							{isImporting ? 'Importing…' : 'Import recipients'}
						</Button>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}

'use client';

import type { Result } from '@/lib/result';
import { CsvRow, parseCsvFile } from '@/lib/utils/csv';
import { Button } from '@socialincome/design-system/actions/button/button';
import { Alert, AlertDescription, AlertTitle } from '@socialincome/design-system/feedback/alert/alert';
import { SuccessBanner } from '@socialincome/design-system/feedback/success-banner/success-banner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@socialincome/design-system/overlays/dialog/dialog';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { CsvDropzone } from './csv-dropzone';
import { CsvPreviewTable } from './csv-preview-table';
import { CsvTemplateDownload } from './csv-template-download';

type CsvTemplate = {
	headers: string[];
	exampleRow: string[];
	filename: string;
};

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	template: CsvTemplate;
	onImport: (file: File) => Promise<Result<{ created: number }>>;
};

export const CsvUploadDialog = ({ open, onOpenChange, title, template, onImport }: Props) => {
	const t = useTranslations('portal-shared');
	const [file, setFile] = useState<File | null>(null);
	const [previewRows, setPreviewRows] = useState<CsvRow[] | null>(null);
	const [isImporting, setIsImporting] = useState(false);
	const [result, setResult] = useState<Result<{ created: number }> | null>(null);

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
			setResult({
				success: false,
				error: error instanceof Error ? error.message : t('csv.parseFailed'),
			});
		}
	};

	const handleImport = async () => {
		if (!file) {
			return;
		}

		setIsImporting(true);
		setResult(null);

		const serviceResult = await onImport(file);

		setIsImporting(false);
		setResult(serviceResult);
	};

	const hasPreview = previewRows && previewRows.length > 0;
	const isSuccess = result?.success === true;

	return (
		<Dialog open={open} onOpenChange={(next) => !next && handleDialogClose()}>
			<DialogContent size="lg">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>

				<CsvTemplateDownload template={template} />

				{!isSuccess && <CsvDropzone onFileSelected={handleFileSelected} />}

				{result && !result.success && (
					<Alert variant="destructive">
						<AlertTitle>{t('csv.importFailed')}</AlertTitle>
						<AlertDescription>{result.error}</AlertDescription>
					</Alert>
				)}

				{isSuccess && (
					<SuccessBanner
						title={t('csv.importCompleted')}
						description={
							result.data.created === 1 ? t('csv.importedOne') : t('csv.importedMany', { count: result.data.created })
						}
					/>
				)}

				{hasPreview && !isSuccess && <CsvPreviewTable rows={previewRows} />}

				<div className="flex justify-end gap-2">
					<Button variant="outline" onClick={handleDialogClose} disabled={isImporting}>
						{isSuccess ? t('csv.close') : t('csv.cancel')}
					</Button>

					{hasPreview && !isSuccess && (
						<Button data-testid="import-button" onClick={handleImport} disabled={isImporting}>
							{isImporting ? t('csv.importing') : t('csv.import')}
						</Button>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
};

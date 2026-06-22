'use client';

import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import { downloadWizardQrBillPdfAction } from '@/lib/server-actions/qr-wizard-actions';
import { cn } from '@/lib/utils/cn';
import { Download } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import type { DonationAmountContext } from '../../utils/donation-amount';
import { downloadBase64File } from '../../utils/download-base64-file';
import type { QrDonorContext } from '../../wizard/donation-wizard-context';

type QrBillPdfDownloadLinkProps = {
	wizardContext: DonationAmountContext;
	contributorReferenceId: string;
	contributionReferenceId: string;
	qrDonor: QrDonorContext;
	currency: string;
	disabled?: boolean;
};

export const QrBillPdfDownloadLink = ({
	wizardContext,
	contributorReferenceId,
	contributionReferenceId,
	qrDonor,
	currency,
	disabled = false,
}: QrBillPdfDownloadLinkProps) => {
	const { t } = useRouteTranslator({ namespace: 'donation-wizard' });
	const [downloading, setDownloading] = useState(false);

	const onDownload = async () => {
		setDownloading(true);

		try {
			const result = await downloadWizardQrBillPdfAction({
				wizardContext,
				contributorReferenceId,
				contributionReferenceId,
				expectedEmail: qrDonor.email,
				currency,
			});

			if (!result.success) {
				toast.error(t('stepQrBill.downloadPdfError'));

				return;
			}

			downloadBase64File(result.data.pdfBase64, 'application/pdf', result.data.filename);
		} catch {
			toast.error(t('stepQrBill.downloadPdfError'));
		} finally {
			setDownloading(false);
		}
	};

	return (
		<button
			type="button"
			disabled={disabled || downloading}
			onClick={() => void onDownload()}
			className={cn(
				'border-foreground text-foreground flex shrink-0 items-center gap-1 border-b pb-0.5 text-sm leading-5 font-normal',
				'hover:text-foreground/80 disabled:cursor-not-allowed disabled:opacity-50',
			)}
		>
			<Download className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
			{downloading ? t('stepQrBill.downloadingPdf') : t('stepQrBill.downloadPdf')}
		</button>
	);
};

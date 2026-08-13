'use client';

import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import { downloadQrBillPdfAction } from '@/lib/server-actions/qr-wizard-actions';
import { downloadSubscriptionQrBillPdfAction } from '@/lib/server-actions/subscription-actions';
import { cn } from '@/lib/utils/cn';
import { Download } from 'lucide-react';
import { forwardRef, useState, type ReactNode } from 'react';
import toast from 'react-hot-toast';

type QrBillPdfDownloadAppearance = {
	disabled?: boolean;
	className?: string;
	children?: ReactNode;
};

type WizardQrBillPdfDownloadLinkProps = QrBillPdfDownloadAppearance & {
	variant?: 'wizard';
	amount: number;
	currency: string;
	contributorReferenceId: string;
	contributionReferenceId: string;
	email: string;
};

type SubscriptionQrBillPdfDownloadLinkProps = QrBillPdfDownloadAppearance & {
	variant: 'subscription';
	subscriptionId: string;
};

type QrBillPdfDownloadLinkProps = WizardQrBillPdfDownloadLinkProps | SubscriptionQrBillPdfDownloadLinkProps;

const triggerPdfDownload = (pdfBase64: string, filename: string) => {
	const bytes = Uint8Array.from(atob(pdfBase64), (character) => character.charCodeAt(0));
	const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	link.rel = 'noopener';
	document.body.append(link);
	link.click();
	link.remove();
	window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

export const QrBillPdfDownloadLink = forwardRef<HTMLButtonElement, QrBillPdfDownloadLinkProps>((props, ref) => {
	const { t } = useRouteTranslator({ namespace: 'donation-wizard' });
	const [downloading, setDownloading] = useState(false);
	const disabled = props.disabled ?? false;

	const onDownload = async () => {
		setDownloading(true);

		try {
			const result =
				props.variant === 'subscription'
					? await downloadSubscriptionQrBillPdfAction(props.subscriptionId)
					: await downloadQrBillPdfAction({
							amount: props.amount,
							currency: props.currency,
							contributorReferenceId: props.contributorReferenceId,
							contributionReferenceId: props.contributionReferenceId,
							expectedEmail: props.email,
						});

			if (!result.success) {
				toast.error(t('stepQrBill.downloadPdfError'));

				return;
			}

			triggerPdfDownload(result.data.pdfBase64, result.data.filename);
		} catch {
			toast.error(t('stepQrBill.downloadPdfError'));
		} finally {
			setDownloading(false);
		}
	};

	return (
		<button
			ref={ref}
			type="button"
			disabled={disabled || downloading}
			onClick={() => void onDownload()}
			className={cn(
				!props.children &&
					'border-primary text-primary hover:text-primary/80 flex shrink-0 items-center gap-1 border-b pb-0.5 text-sm leading-5 font-normal',
				'disabled:cursor-not-allowed disabled:opacity-50',
				props.className,
			)}
		>
			{props.children ?? (
				<>
					<Download className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
					{downloading ? t('stepQrBill.downloadingPdf') : t('stepQrBill.downloadPdf')}
				</>
			)}
		</button>
	);
});
QrBillPdfDownloadLink.displayName = 'QrBillPdfDownloadLink';

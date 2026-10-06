'use client';

import { useRouteTranslator } from '@/lib/i18n/use-route-translator';
import { downloadQrBillPdfAction, downloadSubscriptionQrBillPdfAction } from '@/modules/qr-bills/qr-bill.actions';
import { Button } from '@socialincome/design-system/button/button';
import { Download } from 'lucide-react';
import { forwardRef, useState, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { type DonationAmountContext } from '../../utils/donation-amount';

type QrBillPdfDownloadAppearance = {
	disabled?: boolean;
	/** Link: an underlined text link. Button: a small outline button. */
	appearance?: 'link' | 'button';
	children?: ReactNode;
};

type WizardQrBillPdfDownloadLinkProps = QrBillPdfDownloadAppearance & {
	variant?: 'wizard';
	wizardContext: DonationAmountContext;
	contributorReferenceId: string;
	contributionReferenceId: string;
	email: string;
	currency: string;
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
							wizardContext: props.wizardContext,
							contributorReferenceId: props.contributorReferenceId,
							contributionReferenceId: props.contributionReferenceId,
							expectedEmail: props.email,
							currency: props.currency,
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

	const content = downloading ? (
		<>
			<Download className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
			{t('stepQrBill.downloadingPdf')}
		</>
	) : (
		(props.children ?? (
			<>
				<Download className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
				{t('stepQrBill.downloadPdf')}
			</>
		))
	);

	if (props.appearance === 'button') {
		return (
			<Button
				ref={ref}
				type="button"
				variant="outline"
				size="sm"
				disabled={disabled || downloading}
				onClick={() => void onDownload()}
			>
				{content}
			</Button>
		);
	}

	return (
		<button
			ref={ref}
			type="button"
			disabled={disabled || downloading}
			onClick={() => void onDownload()}
			className="border-primary text-primary hover:text-primary/80 flex shrink-0 items-center gap-1 border-b pb-0.5 text-sm leading-5 font-normal disabled:cursor-not-allowed disabled:opacity-50"
		>
			{content}
		</button>
	);
});
QrBillPdfDownloadLink.displayName = 'QrBillPdfDownloadLink';

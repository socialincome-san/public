'use client';

import { Button } from '@/components/button/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { QrBillPaymentCard } from '@/components/donation-wizard/steps/step-qr-bill/qr-bill-payment-card';
import { QrBillPdfDownloadLink } from '@/components/donation-wizard/steps/step-qr-bill/qr-bill-pdf-download-link';
import { type Currency } from '@/generated/prisma/client';
import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import { type WebsiteLanguage } from '@/lib/i18n/utils';
import { type BankTransferQrBillView } from '@/lib/services/subscription/subscription.types';
import { generateQrBillSvg } from '@/lib/utils/qr-bill';
import { formatCurrencyLocale, formatDateLocale, wholeCurrencyFormatOptions } from '@/lib/utils/string-utils';
import { useMachine } from '@xstate/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { EditSubscriptionDialog } from './edit-subscription/edit-subscription-dialog';
import { editSubscriptionMachine } from './edit-subscription/edit-subscription-machine';
import { SubscriptionPaymentMethodDisplay } from './subscription-payment-method-display';

type Props = {
	lang: WebsiteLanguage;
	subscription: {
		id: string;
		amount: number;
		currency: Currency;
		createdAt: Date;
		paymentDisplay: {
			type: 'bank_transfer';
			qrBill: BankTransferQrBillView | null;
		};
	};
	labels: {
		perMonth: string;
		since: string;
		wireTransfer: string;
		cardFallback: string;
		edit: string;
		viewQr: string;
		qrDialogTitle: string;
		qrUnavailable: string;
		close: string;
	};
};

export const WireSubscriptionRow = ({ lang, subscription, labels }: Props) => {
	const { t: tWizard } = useRouteTranslator({ namespace: 'donation-wizard' });
	const router = useRouter();
	const [state, send] = useMachine(editSubscriptionMachine);
	const [isQrOpen, setIsQrOpen] = useState(false);
	const [qrAmountOverride, setQrAmountOverride] = useState<number | null>(null);
	const { id, amount, currency, createdAt, paymentDisplay } = subscription;
	const qrBill = paymentDisplay.qrBill;
	const qrCurrency = currency === 'CHF' || currency === 'EUR' ? currency : null;
	const isEditOpen = !state.matches('closed');
	const qrAmount = qrAmountOverride ?? amount;

	let qrBillSvg: string | null = null;
	if (isQrOpen && qrBill && qrCurrency) {
		try {
			qrBillSvg = generateQrBillSvg({
				amount: qrAmount,
				contributorReferenceId: qrBill.contributorReferenceId,
				contributionReferenceId: qrBill.contributionReferenceId,
				currency: qrCurrency,
				type: 'QRCODE',
			});
		} catch {
			qrBillSvg = null;
		}
	}

	const dismissEditAndRefresh = () => {
		send({ type: 'DONE' });
		router.refresh();
	};

	const openQrFromSuccess = () => {
		setQrAmountOverride(state.context.amount);
		send({ type: 'DONE' });
		setIsQrOpen(true);
		router.refresh();
	};

	return (
		<>
			<div
				className="border-border flex flex-col gap-4 rounded-xl border p-6 sm:flex-row sm:items-center sm:justify-between"
				data-testid="wire-subscription-row"
			>
				<p className="text-base">
					<span className="font-semibold">{formatCurrencyLocale(amount, currency, lang, wholeCurrencyFormatOptions)}</span>{' '}
					<span className="text-muted-foreground">
						{labels.perMonth} · {labels.since} {formatDateLocale(createdAt, lang)}
					</span>
				</p>
				<div className="flex flex-wrap items-center gap-3">
					<SubscriptionPaymentMethodDisplay paymentDisplay={paymentDisplay} labels={labels} />
					<Button
						type="button"
						variant="outline"
						size="sm"
						className="bg-background"
						onClick={() =>
							send({
								type: 'OPEN',
								subscription: {
									subscriptionId: id,
									initialAmount: Math.round(amount),
									currency,
									paymentMethod: 'bank_transfer',
								},
							})
						}
						aria-haspopup="dialog"
						aria-expanded={isEditOpen}
						data-testid="wire-subscription-edit"
					>
						{labels.edit}
					</Button>
					{qrBill && (
						<Button
							type="button"
							variant="outline"
							size="sm"
							className="bg-background"
							onClick={() => {
								setQrAmountOverride(null);
								setIsQrOpen(true);
							}}
							data-testid="wire-subscription-view-qr"
						>
							{labels.viewQr}
						</Button>
					)}
				</div>
			</div>

			<EditSubscriptionDialog
				lang={lang}
				state={state}
				send={send}
				onDismissAndRefresh={dismissEditAndRefresh}
				onViewQr={qrBill ? openQrFromSuccess : undefined}
			/>

			<Dialog
				open={isQrOpen}
				onOpenChange={(nextOpen) => {
					setIsQrOpen(nextOpen);
					if (!nextOpen) {
						setQrAmountOverride(null);
					}
				}}
			>
				<DialogContent
					className="max-h-[90vh] overflow-y-auto sm:max-w-[820px]"
					onOpenAutoFocus={(event) => event.preventDefault()}
				>
					<DialogHeader>
						<div className="flex w-full items-start gap-4 pr-8">
							<DialogTitle className="shrink-0">{labels.qrDialogTitle}</DialogTitle>
							{qrBillSvg && qrBill && (
								<div className="flex min-w-0 flex-1 items-start justify-end">
									<QrBillPdfDownloadLink variant="subscription" subscriptionId={id} />
								</div>
							)}
						</div>
					</DialogHeader>

					{qrBillSvg && qrBill && qrCurrency ? (
						<div className="flex flex-col gap-6" data-testid="wire-subscription-qr-dialog">
							<QrBillPaymentCard
								qrBillSvg={qrBillSvg}
								amount={qrAmount}
								currency={qrCurrency}
								contributorReferenceId={qrBill.contributorReferenceId}
								contributionReferenceId={qrBill.contributionReferenceId}
								paymentTypeLabel={tWizard('stepQrBill.paymentTypeStandingOrder')}
							/>
							<Button type="button" className="w-full" onClick={() => setIsQrOpen(false)}>
								{labels.close}
							</Button>
						</div>
					) : (
						<p className="text-destructive text-sm" role="alert">
							{labels.qrUnavailable}
						</p>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
};

'use client';

import { Button } from '@/components/button/button';
import { QrBillPdfDownloadLink } from '@/components/donation-wizard/steps/step-qr-bill/qr-bill-pdf-download-link';
import { CircleCheck, QrCode } from 'lucide-react';

type Props = {
	labels: {
		message: string;
		thanks: string;
		done: string;
		standingOrderTitle: string;
		standingOrderDescription: string;
		downloadQr: string;
	};
	onDone: () => void;
	standingOrderSubscriptionId?: string;
	testId?: string;
};

export const EditSubscriptionSuccessStep = ({ labels, onDone, standingOrderSubscriptionId, testId }: Props) => {
	return (
		<div className="flex flex-col items-center gap-8 py-4" data-testid={testId ?? 'edit-subscription-success-step'}>
			<div className="flex flex-col items-center gap-4 text-center">
				<div className="bg-confirm/15 flex size-16 items-center justify-center rounded-full">
					<CircleCheck className="text-confirm size-8" aria-hidden />
				</div>
				<div className="flex flex-col gap-2">
					<p className="text-xl leading-7 font-medium">{labels.message}</p>
					<p className="text-muted-foreground text-sm leading-5">{labels.thanks}</p>
				</div>
			</div>
			{standingOrderSubscriptionId ? (
				<div
					className="bg-muted flex w-full flex-col gap-4 rounded-2xl p-4"
					data-testid="edit-subscription-standing-order-card"
				>
					<div className="flex items-start justify-between gap-3">
						<div className="flex min-w-0 flex-col gap-1">
							<p className="text-sm font-semibold">{labels.standingOrderTitle}</p>
							<p className="text-sm leading-5">{labels.standingOrderDescription}</p>
						</div>
						<div className="border-border bg-background flex size-10 shrink-0 items-center justify-center rounded-lg border">
							<QrCode className="size-5" aria-hidden />
						</div>
					</div>
					<Button variant="outline" size="sm" className="bg-background w-fit" asChild>
						<QrBillPdfDownloadLink variant="subscription" subscriptionId={standingOrderSubscriptionId}>
							<QrCode className="size-4" aria-hidden />
							{labels.downloadQr}
						</QrBillPdfDownloadLink>
					</Button>
				</div>
			) : null}
			<Button type="button" className="w-full" onClick={onDone} data-testid="edit-subscription-done">
				{labels.done}
			</Button>
		</div>
	);
};

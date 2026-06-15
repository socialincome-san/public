'use client';

import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import { Scan } from 'lucide-react';
import Image from 'next/image';
import { QrPaymentDetailField } from '../step-qr-contact/qr-payment-detail-field';

type QrBillPaymentCardProps = {
	qrBillSvg: string;
	donorName: string;
	amountLabel: string;
	paymentTypeLabel: string;
};

const qrSvgClass = '[&_svg]:block [&_svg]:aspect-square [&_svg]:h-auto [&_svg]:w-full [&_svg]:max-w-full';

export const QrBillPaymentCard = ({ qrBillSvg, donorName, amountLabel, paymentTypeLabel }: QrBillPaymentCardProps) => {
	const { t } = useRouteTranslator({ namespace: 'donation-wizard' });

	return (
		<div
			className="border-border relative mx-auto w-full max-w-[771px] rounded-[10px] border"
			data-testid="donation-wizard-qr-code"
		>
			<Image
				src="/assets/postfinance.svg"
				alt="PostFinance"
				width={98}
				height={28}
				className="absolute top-0 right-0 z-10 h-7 w-[98px] rounded-tr-[10px]"
			/>

			<div className="bg-background rounded-t-[10px] px-4 pt-10 pb-6 sm:px-8 sm:pb-8">
				<div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-8">
					<div className="flex w-full max-w-[46mm] min-w-0 items-center justify-center sm:shrink-0">
						<div className={qrSvgClass} dangerouslySetInnerHTML={{ __html: qrBillSvg }} />
					</div>
					<div className="flex w-full min-w-0 flex-1 flex-col gap-4">
						<QrPaymentDetailField label={t('stepQrBill.paymentToLabel')} value={t('stepQrBill.paymentToValue')} />
						<QrPaymentDetailField label={t('stepQrBill.fromLabel')} value={donorName} />
						<QrPaymentDetailField label={t('stepQrBill.amountLabel')} value={amountLabel} />
						<QrPaymentDetailField label={t('stepQrBill.paymentTypeLabel')} value={paymentTypeLabel} />
					</div>
				</div>
			</div>

			<div className="flex items-center gap-2 rounded-b-[10px] bg-green-200 px-4 py-3">
				<Scan className="text-foreground size-4 shrink-0" strokeWidth={1.75} aria-hidden />
				<p className="text-foreground text-sm leading-5 font-medium">{t('stepQrBill.scanHint')}</p>
			</div>
		</div>
	);
};

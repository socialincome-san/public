import { cn } from '@/lib/utils/cn';
import Image from 'next/image';

type PaymentLogoId = 'visa' | 'mastercard' | 'twint' | 'qr-payment' | 'apple-pay';

const paymentLogos: Record<PaymentLogoId, { src: string; alt: string; width: number; height: number; className?: string }> =
	{
		visa: { src: '/assets/payments/visa.svg', alt: 'Visa', width: 35, height: 24 },
		mastercard: { src: '/assets/payments/mastercard.svg', alt: 'Mastercard', width: 35, height: 24 },
		twint: { src: '/assets/payments/twint.svg', alt: 'TWINT', width: 62, height: 24 },
		'qr-payment': { src: '/assets/payments/qr-payment.svg', alt: 'QR Payment', width: 62, height: 24 },
		'apple-pay': { src: '/assets/payments/apple-pay.svg', alt: 'Apple Pay', width: 43, height: 24 },
	};

type PaymentMethodLogoProps = {
	id: PaymentLogoId;
	className?: string;
};

const PaymentMethodLogo = ({ id, className }: PaymentMethodLogoProps) => {
	const logo = paymentLogos[id];

	return (
		<Image
			src={logo.src}
			alt={logo.alt}
			width={logo.width}
			height={logo.height}
			className={cn('h-5 w-auto shrink-0 sm:h-6', className)}
		/>
	);
};

export const QrPaymentLogo = () => <PaymentMethodLogo id="qr-payment" />;

export const OnlinePaymentLogos = () => (
	<div className="flex max-w-full shrink-0 flex-wrap items-center gap-0.5 sm:flex-nowrap sm:gap-1">
		<PaymentMethodLogo id="visa" />
		<PaymentMethodLogo id="mastercard" />
		<PaymentMethodLogo id="twint" />
		<PaymentMethodLogo id="apple-pay" />
	</div>
);

const impactLogoIds: PaymentLogoId[] = ['apple-pay', 'qr-payment', 'visa', 'mastercard', 'twint'];

export const ImpactPaymentLogos = () => (
	<div className="flex flex-nowrap items-center gap-1">
		{impactLogoIds.map((id) => (
			<PaymentMethodLogo key={id} id={id} />
		))}
	</div>
);

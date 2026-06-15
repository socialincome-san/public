export type PaymentLogoId = 'visa' | 'mastercard' | 'twint' | 'qr-payment' | 'apple-pay';

export const paymentLogos: Record<
	PaymentLogoId,
	{ src: string; alt: string; width: number; height: number; className?: string }
> = {
	visa: { src: '/assets/payments/visa.svg', alt: 'Visa', width: 35, height: 24 },
	mastercard: { src: '/assets/payments/mastercard.svg', alt: 'Mastercard', width: 35, height: 24 },
	twint: { src: '/assets/payments/twint.svg', alt: 'TWINT', width: 62, height: 24 },
	'qr-payment': { src: '/assets/payments/qr-payment.svg', alt: 'QR Payment', width: 62, height: 24 },
	'apple-pay': { src: '/assets/payments/apple-pay.svg', alt: 'Apple Pay', width: 43, height: 24 },
};

export const impactPaymentLogoIds: PaymentLogoId[] = ['apple-pay', 'qr-payment', 'visa', 'mastercard', 'twint'];

import { PaymentMethodLogo } from './payment-method-logo';

export const OnlinePaymentLogos = () => (
	<div className="flex max-w-full shrink-0 flex-wrap items-center gap-0.5 sm:flex-nowrap sm:gap-1">
		<PaymentMethodLogo id="visa" />
		<PaymentMethodLogo id="mastercard" />
		<PaymentMethodLogo id="twint" />
		<PaymentMethodLogo id="apple-pay" />
	</div>
);

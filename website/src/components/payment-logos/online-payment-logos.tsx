import { PaymentMethodLogo } from './payment-method-logo';

export const OnlinePaymentLogos = () => (
	<div className="flex w-fit max-w-full flex-wrap items-center gap-1">
		<PaymentMethodLogo id="visa" />
		<PaymentMethodLogo id="mastercard" />
		<PaymentMethodLogo id="twint" />
		<PaymentMethodLogo id="apple-pay" />
	</div>
);

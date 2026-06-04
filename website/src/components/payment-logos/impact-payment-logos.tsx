import { impactPaymentLogoIds } from './payment-logo-config';
import { PaymentMethodLogo } from './payment-method-logo';

export const ImpactPaymentLogos = () => (
	<div className="flex flex-nowrap items-center gap-1">
		{impactPaymentLogoIds.map((id) => (
			<PaymentMethodLogo key={id} id={id} />
		))}
	</div>
);

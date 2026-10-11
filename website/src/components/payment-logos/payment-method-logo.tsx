import Image from 'next/image';
import { type PaymentLogoId, paymentLogos } from './payment-logo-config';

type Props = {
	id: PaymentLogoId;
};

export const PaymentMethodLogo = ({ id }: Props) => {
	const logo = paymentLogos[id];

	return (
		<Image
			src={logo.src}
			alt={logo.alt}
			width={logo.width}
			height={logo.height}
			className="h-5 w-auto max-w-full shrink-0 sm:h-6"
		/>
	);
};

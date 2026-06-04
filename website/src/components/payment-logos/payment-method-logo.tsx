import { cn } from '@/lib/utils/cn';
import Image from 'next/image';
import { type PaymentLogoId, paymentLogos } from './payment-logo-config';

type Props = {
	id: PaymentLogoId;
	className?: string;
};

export const PaymentMethodLogo = ({ id, className }: Props) => {
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

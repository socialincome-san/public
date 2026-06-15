import { cn } from '@/lib/utils/cn';
import Image from 'next/image';
import type { WalletImage } from './wallet.types';

type WalletLayerImageProps = {
	image: WalletImage;
	className?: string;
	decorative?: boolean;
	sizes: string;
};

export const WalletLayerImage = ({ image, className, decorative = false, sizes }: WalletLayerImageProps) => (
	<div className={cn('absolute inset-0 origin-bottom rounded-sm', className)} aria-hidden={decorative ? true : undefined}>
		<Image src={image.src} alt={decorative ? '' : image.alt} fill sizes={sizes} className="rounded-sm object-cover" />
	</div>
);

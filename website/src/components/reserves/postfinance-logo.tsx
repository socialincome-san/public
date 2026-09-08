import { cn } from '@/lib/utils/cn';

type Props = {
	className?: string;
};

const MASK_SRC = '/assets/financial-institutions/postfinance-mask.png';

export const PostFinanceLogo = ({ className }: Props) => {
	return (
		<span
			aria-hidden
			className={cn('bg-foreground inline-block h-[26px] w-[126px] shrink-0', className)}
			style={{
				WebkitMaskImage: `url(${MASK_SRC})`,
				maskImage: `url(${MASK_SRC})`,
				WebkitMaskSize: 'contain',
				maskSize: 'contain',
				WebkitMaskRepeat: 'no-repeat',
				maskRepeat: 'no-repeat',
				WebkitMaskPosition: 'center',
				maskPosition: 'center',
			}}
		/>
	);
};

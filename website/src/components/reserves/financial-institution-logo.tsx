import { PostFinanceLogo } from '@/components/reserves/postfinance-logo';
import { cn } from '@/lib/utils/cn';

const FINANCIAL_INSTITUTION_LOGOS = {
	ecobank: {
		src: '/assets/financial-institutions/ecobank.svg',
		width: 66,
		height: 33,
	},
	'orange-money': {
		src: '/assets/financial-institutions/orange-money.svg',
		width: 124,
		height: 33,
	},
} as const;

export type FinancialInstitutionLogoId = 'postfinance' | keyof typeof FINANCIAL_INSTITUTION_LOGOS;

type Props = {
	id: FinancialInstitutionLogoId;
	label: string;
	className?: string;
};

export const FinancialInstitutionLogo = ({ id, label, className }: Props) => {
	if (id === 'postfinance') {
		return (
			<span role="img" aria-label={label} className={className}>
				<PostFinanceLogo />
			</span>
		);
	}

	const logo = FINANCIAL_INSTITUTION_LOGOS[id];

	return (
		<span
			role="img"
			aria-label={label}
			className={cn('bg-foreground inline-block shrink-0', className)}
			style={{
				width: logo.width,
				height: logo.height,
				WebkitMaskImage: `url(${logo.src})`,
				maskImage: `url(${logo.src})`,
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

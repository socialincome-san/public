import { Card as BaseCard } from '@socialincome/ui/src/components/card';
import { cn } from '@socialincome/ui/src/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { ReactNode } from 'react';

type CardProps = {
	children: ReactNode;
	className?: string;
	style?: React.CSSProperties;
};

const cardVariants = cva('bg-background rounded-3xl shadow-lg ', {
	variants: {
		variant: {
			default: 'p-10',
			noPadding: '',
		},
	},
	defaultVariants: {
		variant: 'default',
	},
});

type CustomCardProps = CardProps & VariantProps<typeof cardVariants>;

export function Card({ children, className, style, variant }: CustomCardProps) {
	return (
		<BaseCard style={style} className={cn(cardVariants({ variant }), className)}>
			{' '}
			{children}
		</BaseCard>
	);
}

import { cn } from '@socialincome/ui';
import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronRightIcon } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

const cardVariants = cva('bg-background rounded-3xl shadow-lg transition-all', {
	variants: {
		variant: {
			default: 'p-10',
			noPadding: '',
		},
		clickable: {
			true: 'hover:shadow-xl hover:-translate-y-1 cursor-pointer',
			false: '',
		},
	},
	defaultVariants: {
		variant: 'default',
		clickable: false,
	},
});

type CardProps = React.HTMLAttributes<HTMLDivElement> &
	VariantProps<typeof cardVariants> & {
		href?: string;
	};

const Card = React.forwardRef<HTMLDivElement, CardProps>(
	({ className, variant, clickable, href, children, ...props }, ref) => {
		const content = (
			<div ref={ref} className={cn(cardVariants({ variant, clickable: !!href }), 'relative', className)} {...props}>
				{href && <ChevronRightIcon className="text-muted-foreground absolute top-6 right-6 h-5 w-5" />}
				{children}
			</div>
		);

		if (href) {
			return <Link href={href}>{content}</Link>;
		}

		return content;
	},
);

Card.displayName = 'Card';

export { Card };

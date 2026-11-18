import { cva, type VariantProps } from 'class-variance-authority';
import { type ReactNode } from 'react';

const proseVariants = cva('prose text-foreground max-w-none prose-a:underline prose-a:underline-offset-4', {
	variants: {
		size: {
			base: 'text-base',
			lg: 'prose-lg',
		},
	},
	defaultVariants: {
		size: 'base',
	},
});

type ProseProps = VariantProps<typeof proseVariants> & {
	// Formatted text such as paragraphs, lists and links
	children: ReactNode;
};

export const Prose = ({ size, children }: ProseProps) => <div className={proseVariants({ size })}>{children}</div>;

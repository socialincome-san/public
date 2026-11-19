import { cva } from 'class-variance-authority';
import { type ReactNode } from 'react';

export type CardAlertFooterVariant = 'confirm' | 'secondary';

const footerVariants = cva('flex items-center gap-2', {
	variants: {
		inset: {
			sm: 'rounded-b-2xl px-4 py-2',
			lg: 'px-6 py-3 sm:px-8',
		},
	},
});

const textVariants = cva('text-foreground min-w-0 flex-1 font-medium', {
	variants: {
		inset: {
			sm: 'text-xs',
			lg: 'text-sm',
		},
	},
});

type Props = {
	text: string;
	variant: CardAlertFooterVariant;
	trailingText?: string;
	// Sits at the end of the line, e.g. a small button
	action?: ReactNode;
	// `lg` lines the footer up with the content of a large card
	inset?: 'sm' | 'lg';
};

export const CardAlertFooter = ({ text, variant, trailingText, action, inset = 'sm' }: Props) => (
	<div className={footerVariants({ inset })}>
		{variant === 'confirm' ? (
			<span className="relative flex size-2 shrink-0" aria-hidden>
				<span className="bg-confirm animation-duration-[2s] absolute inline-flex size-full animate-ping rounded-full opacity-75 motion-reduce:animate-none" />
				<span className="bg-confirm relative inline-flex size-2 rounded-full" />
			</span>
		) : null}
		<p className={textVariants({ inset })}>{text}</p>
		{trailingText ? (
			<p className="text-foreground max-w-1/2 min-w-0 text-right text-xs font-medium">{trailingText}</p>
		) : null}
		{action ? <div className="shrink-0">{action}</div> : null}
	</div>
);

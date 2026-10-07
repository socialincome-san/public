import { cva } from 'class-variance-authority';
import NextLink from 'next/link';
import { type ReactNode } from 'react';
import { CardAlertFooter, type CardAlertFooterVariant } from '../../feedback/card-alert-footer/card-alert-footer';

const shellVariants = cva('flex h-full flex-col rounded-2xl drop-shadow-md', {
	variants: {
		variant: {
			confirm: 'bg-confirm-foreground',
			secondary: 'bg-secondary',
		},
		linked: {
			true: 'group w-full overflow-hidden transition-transform duration-200 ease-out hover:-translate-y-0.5 focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
			false: '',
		},
	},
});

const bodyVariants = cva('border-border bg-card relative flex min-w-0 flex-1 flex-col rounded-2xl border', {
	variants: {
		inset: {
			sm: 'p-3',
			lg: 'p-6',
		},
	},
});

type StatusCardProps = {
	// Without text only the colour of the status shows
	status: { text?: string; variant: CardAlertFooterVariant };
	children: ReactNode;
	// Makes the whole card a link
	href?: string;
	// `none` when the content brings its own card, e.g. a radio card
	inset?: 'none' | 'sm' | 'lg';
};

export const StatusCard = ({ status, children, href, inset = 'lg' }: StatusCardProps) => {
	const content = (
		<>
			{inset === 'none' ? children : <div className={bodyVariants({ inset })}>{children}</div>}
			{status.text ? <CardAlertFooter text={status.text} variant={status.variant} /> : null}
		</>
	);

	return href ? (
		<NextLink href={href} className={shellVariants({ variant: status.variant, linked: true })}>
			{content}
		</NextLink>
	) : (
		<div className={shellVariants({ variant: status.variant, linked: false })}>{content}</div>
	);
};

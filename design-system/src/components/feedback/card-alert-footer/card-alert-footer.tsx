import { type ReactNode } from 'react';

export type CardAlertFooterVariant = 'confirm' | 'secondary';

type Props = {
	text: string;
	variant: CardAlertFooterVariant;
	trailingText?: string;
	// Sits at the end of the line, e.g. a small button
	action?: ReactNode;
};

export const CardAlertFooter = ({ text, variant, trailingText, action }: Props) => (
	<div className="flex items-center gap-2 rounded-b-2xl px-4 py-2">
		{variant === 'confirm' ? (
			<span className="relative flex size-2 shrink-0" aria-hidden>
				<span className="bg-confirm animation-duration-[2s] absolute inline-flex size-full animate-ping rounded-full opacity-75 motion-reduce:animate-none" />
				<span className="bg-confirm relative inline-flex size-2 rounded-full" />
			</span>
		) : null}
		<p className="text-foreground text-xs font-medium">{text}</p>
		{trailingText ? <p className="text-foreground ml-auto text-xs font-medium">{trailingText}</p> : null}
		{action ? <div className="ml-auto shrink-0">{action}</div> : null}
	</div>
);

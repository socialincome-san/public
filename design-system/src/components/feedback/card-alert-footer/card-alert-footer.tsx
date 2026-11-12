import { cn } from '../../../cn';

export type CardAlertFooterVariant = 'confirm' | 'secondary';

type Props = {
	text: string;
	variant: CardAlertFooterVariant;
	trailingText?: string;
	// `lg` lines the footer up with the content of a large card
	inset?: 'sm' | 'lg';
};

export const CardAlertFooter = ({ text, variant, trailingText, inset = 'sm' }: Props) => (
	<div className={cn('flex items-center gap-2', inset === 'lg' ? 'px-6 py-3 sm:px-8' : 'rounded-b-2xl px-4 py-2')}>
		{variant === 'confirm' ? (
			<span className="relative flex size-2 shrink-0" aria-hidden>
				<span className="bg-confirm animation-duration-[2s] absolute inline-flex size-full animate-ping rounded-full opacity-75 motion-reduce:animate-none" />
				<span className="bg-confirm relative inline-flex size-2 rounded-full" />
			</span>
		) : null}
		<p className={cn('text-foreground min-w-0 font-medium', inset === 'lg' ? 'text-sm' : 'text-xs')}>{text}</p>
		{trailingText ? <p className="text-foreground ml-auto text-xs font-medium">{trailingText}</p> : null}
	</div>
);

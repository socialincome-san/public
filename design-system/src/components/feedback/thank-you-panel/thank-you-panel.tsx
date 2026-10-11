import { Heart } from 'lucide-react';
import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../../cn';
import { type WithoutClassName } from '../../../without-class-name';

type ThankYouPanelProps = WithoutClassName<HTMLAttributes<HTMLDivElement>> & {
	message: string;
	title: string;
	description: ReactNode;
	action: ReactNode;
	actionHint?: string;
	support: { prefix: string; email: string };
	padding?: 'wide' | 'compact';
};

export const ThankYouPanel = ({
	message,
	title,
	description,
	action,
	actionHint,
	support,
	padding = 'wide',
	...props
}: ThankYouPanelProps) => (
	<div className={cn('flex w-full flex-col items-center gap-6', padding === 'wide' ? 'px-9 pt-6 pb-7' : 'py-4')} {...props}>
		<div className="flex items-center gap-2">
			<Heart className="text-foreground size-4 fill-current" strokeWidth={1.5} aria-hidden />
			<p className="text-foreground text-base leading-normal font-medium">{message}</p>
		</div>

		<div className="flex w-full flex-col gap-4 text-center">
			<p className="text-foreground text-2xl leading-normal font-medium">{title}</p>
			<p className="text-foreground text-base leading-normal">{description}</p>
		</div>

		<div className="flex w-full flex-col items-center gap-3">
			{actionHint ? <p className="text-foreground text-sm">{actionHint}</p> : null}
			{action}
		</div>

		<p className="text-foreground text-center text-sm leading-none">
			{support.prefix}{' '}
			<a className="underline" href={`mailto:${support.email}`}>
				{support.email}
			</a>
		</p>
	</div>
);

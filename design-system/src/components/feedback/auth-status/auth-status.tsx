import { cva } from 'class-variance-authority';
import { Loader2, LogIn, MailCheck, TriangleAlert } from 'lucide-react';
import { type ReactNode } from 'react';

const iconVariants = cva('flex size-14 items-center justify-center rounded-2xl [&_svg]:size-7', {
	variants: {
		status: {
			sent: 'bg-confirm-foreground text-confirm',
			confirm: 'bg-muted text-foreground',
			loading: 'bg-muted text-foreground',
			error: 'bg-destructive-foreground text-destructive',
		},
	},
});

const icons = {
	sent: <MailCheck />,
	confirm: <LogIn />,
	loading: <Loader2 className="motion-safe:animate-spin" />,
	error: <TriangleAlert />,
};

type AuthStatusProps = {
	status: 'sent' | 'confirm' | 'loading' | 'error';
	title: string;
	// Wrap words to emphasise, such as an email address, in <strong>
	description?: ReactNode;
	// Small print below the actions, e.g. a support contact
	hint?: ReactNode;
	// Buttons or links, stacked full width
	children?: ReactNode;
};

export const AuthStatus = ({ status, title, description, hint, children }: AuthStatusProps) => (
	<div className="flex flex-col gap-8" role={status === 'error' ? 'alert' : 'status'}>
		<div className={iconVariants({ status })} aria-hidden>
			{icons[status]}
		</div>

		<div className="flex flex-col gap-2">
			<h1 className="text-foreground text-3xl font-medium tracking-tight">{title}</h1>
			{description ? (
				<p className="text-muted-foreground [&_strong]:text-foreground text-base [&_strong]:font-medium">{description}</p>
			) : null}
		</div>

		{children ? <div className="flex flex-col gap-3">{children}</div> : null}

		{hint ? <p className="text-muted-foreground text-sm">{hint}</p> : null}
	</div>
);

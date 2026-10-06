import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { type WithoutClassName } from '../../../without-class-name';

const alertVariants = cva(
	'relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current',
	{
		variants: {
			variant: {
				default: 'bg-card text-card-foreground',
				destructive: 'text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	},
);

const Alert = ({
	variant,
	...props
}: WithoutClassName<React.ComponentProps<'div'>> & VariantProps<typeof alertVariants>) => {
	return <div data-slot="alert" role="alert" className={alertVariants({ variant })} {...props} />;
};

const AlertTitle = (props: WithoutClassName<React.ComponentProps<'div'>>) => {
	return <div data-slot="alert-title" className="col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight" {...props} />;
};

// Long messages such as server errors scroll instead of widening the alert
const AlertDescription = (props: WithoutClassName<React.ComponentProps<'div'>>) => {
	return (
		<div
			data-slot="alert-description"
			className="text-muted-foreground col-start-2 grid max-w-full justify-items-start gap-1 overflow-auto text-sm [&_p]:leading-relaxed"
			{...props}
		/>
	);
};

export { Alert, AlertDescription, AlertTitle };

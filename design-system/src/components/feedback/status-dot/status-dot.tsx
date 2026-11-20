import { cva } from 'class-variance-authority';

const dotVariants = cva('relative inline-flex size-2 rounded-full', {
	variants: {
		variant: {
			live: 'bg-confirm',
			// A ring in the text color
			inactive: 'border border-current',
		},
	},
});

type StatusDotProps = {
	// `live` pulses: something is happening right now
	variant: 'live' | 'inactive';
};

/** A small dot before a status text. Decorative: the text next to it says the status. */
export const StatusDot = ({ variant }: StatusDotProps) => (
	<span className="relative flex size-2 shrink-0" aria-hidden="true">
		{variant === 'live' ? (
			<span className="bg-confirm animation-duration-[2s] absolute inline-flex size-full animate-ping rounded-full opacity-75 motion-reduce:animate-none" />
		) : null}
		<span className={dotVariants({ variant })} />
	</span>
);

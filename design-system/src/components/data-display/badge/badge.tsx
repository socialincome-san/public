import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '../../../cn';
import { type WithoutClassName } from '../../../without-class-name';

const gradientOutlineVariants = ['gradient-outline', 'gradient-outline-background'] as const;

type GradientOutlineVariant = (typeof gradientOutlineVariants)[number];

const isGradientOutlineVariant = (variant: unknown): variant is GradientOutlineVariant =>
	gradientOutlineVariants.some((gradientVariant) => gradientVariant === variant);

const badgeVariants = cva(
	// Badges wrapped in a link react to hovering the link
	'inline-flex items-center gap-1.5 rounded-full border text-xs transition-opacity [a:hover>&]:opacity-80',
	{
		variants: {
			// Filled variants set their color scheme, so content such as AnimatedCircleIcon matches the badge, not its parent
			variant: {
				default: 'bg-muted border-border text-foreground scheme-light',
				secondary: 'bg-warning-foreground border-warning/30 text-foreground scheme-light',
				outline: 'bg-accent border-accent text-accent-foreground scheme-light',
				'outline-solid': 'border-foreground text-foreground bg-transparent',
				destructive: 'bg-destructive-foreground border-destructive/30 text-destructive scheme-light',
				verified: 'bg-confirm-foreground border-confirm/30 text-confirm scheme-light',
				country: 'bg-background border-border text-foreground scheme-light',
				fundraising:
					'bg-confirm-foreground border-confirm/30 text-foreground text-sm leading-none font-medium whitespace-nowrap scheme-light',
				video: 'bg-black/60 border-white/40 text-white backdrop-blur-sm scheme-dark',
				// Translucent, for dark surfaces
				ghost: 'bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground scheme-dark',
				frosted: 'bg-white/80 border-white/40 text-foreground whitespace-nowrap backdrop-blur-sm scheme-light',
				primary: 'bg-primary border-primary text-primary-foreground scheme-dark',
				'primary-outline': 'border-primary/40 text-primary bg-transparent',
				// The surface only: Badge wraps it in gradientOutlineRing, which draws the outline
				'gradient-outline': 'bg-muted text-foreground relative z-1 border-0 font-medium scheme-light',
				// Same outline on a white surface, for muted or tinted backgrounds
				'gradient-outline-background': 'bg-background text-foreground relative z-1 border-0 font-medium scheme-light',
			},
			size: {
				sm: 'gap-0.5 px-2 py-0.5 text-2xs',
				default: 'px-1.5 py-1',
				lg: 'px-3 py-1.5 font-medium',
				// A leading AnimatedCircleIcon sits close to the rounded edge; other icons keep both sides equal
				xl: 'gap-2 px-4 py-1.5 text-sm font-medium has-[>[data-slot=animated-circle-icon]:first-child]:pl-1.5',
			},
		},
		compoundVariants: [
			{
				variant: 'fundraising',
				size: 'default',
				className: 'px-2',
			},
			{
				// After the size classes, so an icon sits on the text baseline in every size. No wrapping: the ring square is sized from the width
				variant: [...gradientOutlineVariants],
				className: 'items-baseline justify-center gap-[0.3em] whitespace-nowrap',
			},
			{
				// Text and PeopleIcon sit on the baseline; other icons and flags are centered on the line.
				// Lucide icons follow the text size. Their glyphs sit inside empty space, which the negative margin takes
				// back, so the gap to the text and to the edge look the same as for text or a tight icon like PeopleIcon
				variant: [...gradientOutlineVariants],
				className:
					'[&>[data-slot=country-flag]]:self-center [&>svg:not([data-slot=people-icon])]:self-center [&>svg.lucide]:-mx-[0.15em] [&>svg.lucide]:size-[1em] [&>svg.lucide]:shrink-0',
			},
			// Min width equals the height (line height plus padding), so a single digit gives a circle, never a narrow pill.
			// sm takes less padding than the other variants, or a digit plus padding would be wider than the height.
			// xl keeps its label padding, so a single digit there is slightly wider than tall
			{ variant: [...gradientOutlineVariants], size: 'sm', className: 'min-w-4.5 px-1.5' },
			{ variant: [...gradientOutlineVariants], size: 'default', className: 'min-w-6' },
			{ variant: [...gradientOutlineVariants], size: 'lg', className: 'min-w-7' },
			{ variant: [...gradientOutlineVariants], size: 'xl', className: 'min-w-8' },
		],
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

type BadgeProps = WithoutClassName<React.HTMLAttributes<HTMLDivElement>> & VariantProps<typeof badgeVariants>;

// A conic gradient square, larger than the badge and clipped to its pill shape, rotates behind the surface.
// The 1.5px padding is the visible outline. Without motion the gradient stays, green on the left.
const gradientOutlineRing =
	'relative isolate inline-flex overflow-hidden rounded-full p-[1.5px] transition-opacity [a:hover>&]:opacity-80 before:absolute before:top-1/2 before:left-1/2 before:aspect-square before:w-[150%] before:-translate-1/2 before:rotate-90 before:animate-outline-spin before:bg-[conic-gradient(hsl(var(--gradient-button-from)),hsl(var(--gradient-button-to))_50%,hsl(var(--gradient-button-from)))] motion-reduce:before:animate-none';

const Badge = ({ variant, size, children, ...props }: BadgeProps) => {
	if (isGradientOutlineVariant(variant)) {
		return (
			<div className={gradientOutlineRing}>
				<div className={cn(badgeVariants({ variant, size }))} {...props}>
					{children}
				</div>
			</div>
		);
	}

	// cn so variant and compound classes override conflicting base classes
	return (
		<div className={cn(badgeVariants({ variant, size }))} {...props}>
			{children}
		</div>
	);
};

export { Badge, badgeVariants };

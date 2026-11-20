import { cva, type VariantProps } from 'class-variance-authority';
import { type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { type WithoutClassName } from '../../../without-class-name';

const frameVariants = cva('bg-foreground relative w-full overflow-hidden transition-[border-radius] duration-300 ease-out', {
	variants: {
		// `media` keeps the shape of a video, `content` grows with what is inside
		size: {
			media: 'aspect-video max-h-[80vh] min-h-112 md:min-h-160',
			content: '',
		},
		expanded: {
			true: 'z-60',
			false: 'md:rounded-b-5xl rounded-b-3xl',
		},
	},
	defaultVariants: {
		size: 'media',
		expanded: false,
	},
});

// The type of every hero, so a hero without media reads like the one on the landing page
export const heroTitleVariants = cva('', {
	variants: {
		variant: {
			bold: 'text-5xl leading-tight font-bold text-pretty md:text-6xl',
			light: 'text-4xl xl:text-6xl [&_strong]:font-bold',
		},
	},
});

export const heroDescriptionVariants = cva('', {
	variants: {
		variant: {
			bold: 'text-xl',
			light: 'text-lg lg:text-2xl',
		},
	},
});

type HeroShellProps = WithoutClassName<HTMLAttributes<HTMLElement>> &
	Pick<VariantProps<typeof frameVariants>, 'size'> & {
		children: ReactNode;
		// Below the dark frame
		below?: ReactNode;
		// The frame fills the screen without rounding, e.g. a video played full size
		expanded?: boolean;
		frameStyle?: CSSProperties;
	};

/**
 * The dark frame of a hero: full width, from the very top of the page behind the floating site header, with only
 * the two bottom corners rounded. `full-bleed-hero` is what tells the website shell to drop the space for the header.
 */
export const HeroShell = ({ children, below, size, expanded = false, frameStyle, ...props }: HeroShellProps) => (
	<section className="storyblok__outline full-bleed-hero flex flex-col gap-6" {...props}>
		<div className={frameVariants({ size, expanded })} style={frameStyle}>
			{children}
		</div>
		{below}
	</section>
);

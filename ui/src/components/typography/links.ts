import { cva } from 'class-variance-authority';

/**
 * A utility for generating consistent link styles that follow the project's design system.
 *
 * @example
 * ```tsx
 * import Link from 'next/link';
 * import { linkCn } from '@/components/typography/links';
 *
 * <Link href="/about" className={linkCn()}>About</Link>
 * <Link href="/contact" className={linkCn({ variant: 'accent' })}>Contact</Link>
 * <Link href="/blog" className={linkCn({ size: 'lg', underline: 'hover' })}>Blog</Link>
 * <Link href="/docs" className={linkCn({ icon: true })}>
 *   <Icon className="h-4 w-4" /> Documentation
 * </Link>
 * <Link href="/internal" className={linkCn({ arrow: 'internal' })}>Internal Link</Link>
 * <Link href="https://external.com" className={linkCn({ arrow: 'external' })}>External Link</Link>
 * ```
 */
export const linkCn = cva(
	'inline-flex items-center font-normal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 relative after:transition-transform after:duration-200 after:no-underline',
	{
		variants: {
			variant: {
				default: 'text-foreground focus-visible:text-accent',
				accent: 'text-accent focus-visible:text-accent/80 active:text-accent-muted',
				destructive: 'text-destructive focus-visible:text-destructive/80',
			},
			size: {
				inherit: '',
				sm: 'text-sm',
				md: 'text-base',
				lg: 'text-lg',
				xl: 'text-xl',
				'4xl': 'text-4xl',
			},
			weight: {
				regular: 'font-normal',
				medium: 'font-medium',
				semibold: 'font-semibold',
				bold: 'font-bold',
			},
			underline: {
				none: 'no-underline hover:no-underline',
				hover: 'hover:underline hover:decoration-accent underline-offset-4',
				always: 'underline underline-offset-4 hover:decoration-accent',
			},
			icon: {
				true: 'gap-2',
				false: '',
			},
			arrow: {
				false: '',
				internal: 'after:content-["→"] after:ml-1 after:text-[1.2em] after:inline-block hover:after:translate-x-1',
				external:
					'after:content-["↗"] after:ml-1 after:text-[1.2em] after:inline-block hover:after:translate-x-1 hover:after:translate-y-[-0.1em]',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'inherit',
			weight: 'regular',
			underline: 'always',
			icon: false,
			arrow: false,
		},
		compoundVariants: [
			{
				underline: 'none',
				variant: 'default',
				arrow: false,
				className: ['hover:text-accent'],
			},
			{
				underline: 'none',
				variant: 'accent',
				arrow: false,
				className: ['hover:text-foreground/80'],
			},
			{
				underline: 'none',
				variant: 'destructive',
				arrow: false,
				className: ['hover:text-foreground/80'],
			},
			{
				underline: 'always',
				variant: 'accent',
				className: ['hover:decoration-foreground'],
			},
		],
	},
);
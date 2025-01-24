import { cva } from 'class-variance-authority';

/**
 * A utility for generating consistent link styles that follow the project's design system.
 * 
 * @example
 * ```tsx
 * import Link from 'next/link';
 * import { linkCn } from '@/components/typography/links';
 * 
 * // Basic usage
 * <Link href="/about" className={linkCn()}>About</Link>
 * 
 * // With variants
 * <Link href="/contact" className={linkCn({ variant: 'accent' })}>Contact</Link>
 * 
 * // With size and underline
 * <Link href="/blog" className={linkCn({ size: 'lg', underline: 'hover' })}>Blog</Link>
 * 
 * // With icon
 * <Link href="/docs" className={linkCn({ icon: true })}>
 *   <Icon /> Documentation
 * </Link>
 * ```
 * 
 * @param variant - The visual style variant of the link
 *   - 'default': Primary colored link with muted hover state
 *   - 'muted': Subtle link that becomes more prominent on hover
 *   - 'nav': Large navigation link with accent hover state
 *   - 'footer': Muted link for footer usage
 *   - 'accent': Accent colored link for emphasis
 *   - 'destructive': Red-colored link for dangerous actions
 *   - 'ghost': Transparent link that shows accent color on hover
 * 
 * @param size - The text size of the link
 *   - 'sm': Small text
 *   - 'md': Medium text (default)
 *   - 'lg': Large text
 *   - 'xl': Extra large text
 *   - '4xl': 4x large text (for hero sections)
 * 
 * @param underline - The underline style of the link
 *   - 'none': No underline (default)
 *   - 'hover': Shows underline on hover
 *   - 'always': Always shows underline
 * 
 * @param icon - Whether the link contains an icon
 *   - true: Adds gap between icon and text
 *   - false: No gap (default)
 */
export const linkCn = cva(
  'inline-flex items-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 relative after:transition-transform after:duration-200 after:no-underline',
  {
    variants: {
      variant: {
        default: 'text-primary hover:text-primary-muted focus-visible:text-primary-muted',
        muted: 'text-muted-foreground hover:text-primary focus-visible:text-primary',
        nav: 'text-foreground font-medium hover:text-accent focus-visible:text-accent active:text-accent-muted',
        footer: 'text-muted-foreground hover:text-foreground focus-visible:text-foreground group-hover:text-foreground',
        accent: 'text-accent hover:text-accent-muted focus-visible:text-accent-muted',
        destructive: 'text-destructive hover:text-destructive-muted focus-visible:text-destructive-muted',
        ghost: 'text-foreground hover:text-accent focus-visible:text-accent',
      },
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
        '4xl': 'text-4xl',
      },
      underline: {
        none: '',
        hover: 'hover:underline underline-offset-4',
        always: 'underline underline-offset-4',
      },
      icon: {
        true: 'gap-2',
        false: '',
      },
      arrow: {
        true: 'after:content-["→"] after:ml-0.5 after:text-[0.85em] after:inline-block after:opacity-70 hover:after:translate-x-0.5 hover:after:opacity-100',
        false: '',
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      underline: 'none',
      icon: false,
      arrow: false,
    },
  }
);

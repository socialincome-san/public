// Claude Design has no Next.js router: next/link renders a plain anchor.
import { type AnchorHTMLAttributes, forwardRef } from 'react';

type Href = string | { pathname?: string; query?: Record<string, string>; hash?: string };

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
	href: Href;
	prefetch?: boolean;
	replace?: boolean;
	scroll?: boolean;
	shallow?: boolean;
	locale?: string | false;
};

const toHref = (href: Href) =>
	typeof href === 'string'
		? href
		: `${href.pathname ?? ''}${href.query ? `?${new URLSearchParams(href.query)}` : ''}${href.hash ? `#${href.hash.replace(/^#/, '')}` : ''}`;

const Link = forwardRef<HTMLAnchorElement, LinkProps>(
	({ href, prefetch: _p, replace: _r, scroll: _s, shallow: _sh, locale: _l, ...props }, ref) => (
		<a ref={ref} href={toHref(href)} {...props} />
	),
);
Link.displayName = 'Link';

export type { LinkProps };
export default Link;

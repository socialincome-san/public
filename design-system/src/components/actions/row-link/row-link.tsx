import NextLink, { type LinkProps } from 'next/link';

type RowLinkProps = {
	label: string;
	href: LinkProps['href'];
	testId?: string;
};

// Fills the height of its parent, so it lines up with the other rows of a list
export const RowLink = ({ label, href, testId }: RowLinkProps) => (
	<NextLink
		href={href}
		data-testid={testId}
		className="border-input/60 hover:bg-muted/50 focus-visible:ring-ring text-muted-foreground hover:text-foreground flex h-full items-center rounded-xl border px-5 py-3 text-sm leading-5 font-medium transition-colors focus-visible:ring-1 focus-visible:outline-hidden"
	>
		{label}
	</NextLink>
);

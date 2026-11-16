import { ArrowUpRight, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

type FootnoteCardProps = {
	children: ReactNode;
	// Shown in a muted strip below the content, e.g. who verified it
	footnote?: ReactNode;
	footnoteIcon?: LucideIcon;
};

export const FootnoteCard = ({ children, footnote, footnoteIcon: FootnoteIcon }: FootnoteCardProps) => (
	<div className="border-border bg-card overflow-hidden rounded-2xl border">
		<div className="p-6">{children}</div>
		{footnote ? (
			<div className="border-border bg-muted/40 text-muted-foreground flex items-start gap-2 border-t px-6 py-4 text-sm">
				{FootnoteIcon ? <FootnoteIcon className="mt-0.5 size-4 shrink-0" strokeWidth={1.7} aria-hidden="true" /> : null}
				<p>{footnote}</p>
			</div>
		) : null}
	</div>
);

type FootnoteCardLinkProps = {
	href: string;
	children: ReactNode;
};

export const FootnoteCardLink = ({ href, children }: FootnoteCardLinkProps) => (
	<Link href={href} className="inline-flex items-center gap-0.5 underline-offset-4 hover:underline">
		{children}
		<ArrowUpRight className="size-3" aria-hidden="true" />
	</Link>
);

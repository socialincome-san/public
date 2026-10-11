import { cva } from 'class-variance-authority';
import { ChevronRight, ExternalLink } from 'lucide-react';
import Link, { type LinkProps } from 'next/link';

const pillVariants = cva(
	'text-foreground bg-muted inline-flex w-fit items-center gap-1.5 rounded-full py-1.5 pr-2 pl-3 text-xs font-bold',
	{
		variants: {
			interactive: {
				true: 'focus-visible:ring-ring hover:bg-muted/80 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
				false: '',
			},
		},
	},
);

type LinkPillProps = {
	label: string;
	href?: LinkProps['href'];
	// Opens the link in a new tab
	external?: boolean;
	onClick?: () => void;
	// For a pill that opens a dialog
	isOpen?: boolean;
};

export const LinkPill = ({ label, href, external = false, onClick, isOpen = false }: LinkPillProps) => {
	if (href) {
		return (
			<Link
				href={href}
				target={external ? '_blank' : undefined}
				rel={external ? 'noopener noreferrer' : undefined}
				className={pillVariants({ interactive: true })}
			>
				{label}
				<ExternalLink className="size-4 shrink-0" aria-hidden="true" />
			</Link>
		);
	}

	if (onClick) {
		return (
			<button
				type="button"
				onClick={onClick}
				aria-haspopup="dialog"
				aria-expanded={isOpen}
				className={pillVariants({ interactive: true })}
			>
				{label}
				<ChevronRight className="size-4 shrink-0" aria-hidden="true" />
			</button>
		);
	}

	return (
		<span className={pillVariants({ interactive: false })}>
			{label}
			<ChevronRight className="size-4 shrink-0" aria-hidden="true" />
		</span>
	);
};

import { ChevronRight } from 'lucide-react';
import type { LinkProps } from 'next/link';
import Link from 'next/link';

type Props = {
	label: string;
	href?: LinkProps['href'];
};

export const ProgramDetailPill = ({ label, href }: Props) => {
	if (href) {
		return (
			<Link
				href={href}
				className="text-foreground inline-flex items-center gap-1.5 rounded-full bg-slate-100 py-1.5 pr-2 pl-3 text-xs font-bold transition-colors hover:bg-slate-200 focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
			>
				{label}
				<ChevronRight className="size-4 shrink-0" aria-hidden="true" />
			</Link>
		);
	}

	return (
		<span className="text-foreground inline-flex items-center gap-1.5 rounded-full bg-slate-100 py-1.5 pr-2 pl-3 text-xs font-bold">
			{label}
			<ChevronRight className="size-4 shrink-0" aria-hidden="true" />
		</span>
	);
};

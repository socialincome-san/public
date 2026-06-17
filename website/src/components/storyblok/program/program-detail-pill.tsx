import { ChevronRight } from 'lucide-react';
import type { LinkProps } from 'next/link';
import Link from 'next/link';

const pillClassName =
	'text-foreground inline-flex items-center gap-1.5 rounded-full bg-slate-100 py-1.5 pr-2 pl-3 text-xs font-bold';
const interactivePillClassName = `${pillClassName} focus-visible:ring-ring transition-colors hover:bg-slate-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none`;

type Props = {
	label: string;
	href?: LinkProps['href'];
	onClick?: () => void;
	isOpen?: boolean;
};

export const ProgramDetailPill = ({ label, href, onClick, isOpen = false }: Props) => {
	if (href) {
		return (
			<Link href={href} className={interactivePillClassName}>
				{label}
				<ChevronRight className="size-4 shrink-0" aria-hidden="true" />
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
				className={interactivePillClassName}
			>
				{label}
				<ChevronRight className="size-4 shrink-0" aria-hidden="true" />
			</button>
		);
	}

	return (
		<span className={pillClassName}>
			{label}
			<ChevronRight className="size-4 shrink-0" aria-hidden="true" />
		</span>
	);
};

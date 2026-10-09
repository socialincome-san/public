import { ChevronRightIcon } from 'lucide-react';
import Link from 'next/link';
import { type ReactNode } from 'react';

type StatPanelProps = {
	children: ReactNode;
	href?: string;
};

export const StatPanel = ({ children, href }: StatPanelProps) => {
	const content = (
		<div className="bg-muted relative flex h-full flex-col gap-6 rounded-2xl p-4">
			{href ? <ChevronRightIcon className="text-muted-foreground absolute top-4 right-4 h-4 w-4" /> : null}
			{children}
		</div>
	);

	if (!href) {
		return content;
	}

	return (
		<Link href={href} className="block h-full transition-transform hover:-translate-y-[5px] hover:shadow-xs">
			{content}
		</Link>
	);
};

import { cn } from '@socialincome/ui/src/lib/utils';
import { ChevronRightIcon } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

type SectionBoxProps = {
	className?: string;
	children: React.ReactNode;
	href?: string;
};

export function SectionBox({ className, children, href }: SectionBoxProps) {
	const content = (
		<div className={cn('relative h-full space-y-4 rounded-2xl bg-slate-100 p-4', className)}>
			{href ? <ChevronRightIcon className="text-muted-foreground absolute right-4 top-4 h-4 w-4" /> : null}
			{children}
		</div>
	);

	if (href) {
		return (
			<Link href={href} className="block transition-transform hover:-translate-y-[5px] hover:shadow-sm">
				{content}
			</Link>
		);
	}

	return content;
}

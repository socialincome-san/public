import { ChevronRightIcon } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

type SectionBoxProps = {
	children: React.ReactNode;
	href?: string;
};

export const SectionBox = ({ children, href }: SectionBoxProps) => {
	const content = (
		<div className="bg-muted relative h-full space-y-4 rounded-2xl p-4">
			{href ? <ChevronRightIcon className="text-muted-foreground absolute top-4 right-4 h-4 w-4" /> : null}
			{children}
		</div>
	);

	if (href) {
		return (
			<Link href={href} className="block h-full transition-transform hover:-translate-y-[5px] hover:shadow-xs">
				{content}
			</Link>
		);
	}

	return content;
};

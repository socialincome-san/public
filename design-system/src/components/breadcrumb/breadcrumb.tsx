import { Home } from 'lucide-react';
import React from 'react';

import {
	BreadcrumbElements,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator,
} from './breadcrumb-elements';

export type BreadcrumbLinkItem = {
	label: string;
	href: string;
};

export const Breadcrumb = ({ links, className }: { links: BreadcrumbLinkItem[]; className?: string }) => {
	return (
		<BreadcrumbElements className={className}>
			<BreadcrumbList>
				{links.map((link, index) => {
					const isLast = index === links.length - 1;
					const isHome = index === 0;
					const content = isHome ? (
						<>
							<span aria-hidden="true">
								<Home className="h-4 w-4 sm:hidden" />
								<span className="hidden sm:inline">{link.label}</span>
							</span>
							<span className="sr-only">{link.label}</span>
						</>
					) : (
						link.label
					);

					return (
						<React.Fragment key={`${link.href}-${link.label}`}>
							<BreadcrumbItem>
								{isLast ? <span>{content}</span> : <BreadcrumbLink href={link.href}>{content}</BreadcrumbLink>}
							</BreadcrumbItem>
							{isLast ? null : <BreadcrumbSeparator />}
						</React.Fragment>
					);
				})}
			</BreadcrumbList>
		</BreadcrumbElements>
	);
};

import {
	BreadcrumbElements,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator,
} from '@/components/breadcrumb/breadcrumb-elements';
import { cn } from '@/lib/utils/cn';
import React from 'react';

export type BreadcrumbLinkType = {
	label: string;
	href: string;
};

export const Breadcrumb = ({ links, className }: { links: BreadcrumbLinkType[]; className?: string }) => {
	return (
		<div className={cn('py-9', className)}>
			<BreadcrumbElements>
				<BreadcrumbList>
					{links.map((link: BreadcrumbLinkType, index: number) => {
						const isLast: boolean = index === links.length - 1;

						return (
							<React.Fragment key={index}>
								<BreadcrumbItem key={index}>
									{isLast ? <span>{link.label}</span> : <BreadcrumbLink href={link.href}>{link.label}</BreadcrumbLink>}
								</BreadcrumbItem>
								{isLast ? null : <BreadcrumbSeparator />}
							</React.Fragment>
						);
					})}
				</BreadcrumbList>
			</BreadcrumbElements>
		</div>
	);
};

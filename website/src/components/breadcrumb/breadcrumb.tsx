import {
	BreadcrumbElements,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator,
} from '@/components/breadcrumb/breadcrumb-elements';
import type { BreadcrumbLink as BreadcrumbLinkItem } from '@/components/breadcrumb/build-breadcrumb-links';
import React from 'react';

export const Breadcrumb = ({ links }: { links: BreadcrumbLinkItem[] }) => {
	return (
		<div className="py-9">
			<BreadcrumbElements>
				<BreadcrumbList>
					{links.map((link: BreadcrumbLinkItem, index: number) => {
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

import {
	BreadcrumbElements,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator,
} from '@/components/breadcrumb/breadcrumb-elements';
import React from 'react';

export interface BreadcrumbLinkType {
	label: string;
	href: string;
}

export const Breadcrumb = ({ links }: { links: BreadcrumbLinkType[] }) => {
	return (
		<div className="py-9">
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

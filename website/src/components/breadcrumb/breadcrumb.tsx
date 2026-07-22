import { BlockWrapper } from '@/components/block-wrapper';
import {
	BreadcrumbElements,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator,
} from '@/components/breadcrumb/breadcrumb-elements';
import type { BreadcrumbLink as BreadcrumbLinkItem } from '@/components/breadcrumb/build-breadcrumb-links';
import { cn } from '@/lib/utils/cn';
import { Home } from 'lucide-react';
import React from 'react';

export type { BreadcrumbLink as BreadcrumbLinkType } from '@/components/breadcrumb/build-breadcrumb-links';

export const Breadcrumb = ({ links, className }: { links: BreadcrumbLinkItem[]; className?: string }) => {
	return (
		<BlockWrapper className={cn('py-9', className)} disableMarginTop={true} disableMarginBottom={true}>
			<BreadcrumbElements>
				<BreadcrumbList>
					{links.map((link: BreadcrumbLinkItem, index: number) => {
						const isLast: boolean = index === links.length - 1;
						const isHome: boolean = index === 0;

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
							<React.Fragment key={index}>
								<BreadcrumbItem key={index}>
									{isLast ? <span>{content}</span> : <BreadcrumbLink href={link.href}>{content}</BreadcrumbLink>}
								</BreadcrumbItem>
								{isLast ? null : <BreadcrumbSeparator />}
							</React.Fragment>
						);
					})}
				</BreadcrumbList>
			</BreadcrumbElements>
		</BlockWrapper>
	);
};

'use client';

import {
	BreadcrumbElements,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator,
} from '@/app/portal/components/breadcrumb/breadcrumb-elements';

import { usePathname } from 'next/navigation';
import React from 'react';

export function PageHeader() {
	const pathname = usePathname();
	const segments = pathname.split('/').filter(Boolean);

	return (
		<div className="container mx-auto flex flex-col border border-red-500 py-9">
			<BreadcrumbElements>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink href="/">Home</BreadcrumbLink>
					</BreadcrumbItem>
					{segments.map((segment, index) => {
						const href = '/' + segments.slice(0, index + 1).join('/');
						const isLast = index === segments.length - 1;

						return (
							<React.Fragment key={index}>
								<BreadcrumbSeparator />
								<BreadcrumbItem key={index}>
									{isLast ? <span>{segment}</span> : <BreadcrumbLink href={href}>{segment}</BreadcrumbLink>}
								</BreadcrumbItem>
							</React.Fragment>
						);
					})}
				</BreadcrumbList>
			</BreadcrumbElements>
		</div>
	);
}

'use client';

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator,
} from '@/app/portal/components/ui/breadcrumb';

import { usePathname } from 'next/navigation';

export function PageHeader4() {
	const pathname = usePathname();
	const segments = pathname.split('/').filter(Boolean);

	return (
		<div className="container mx-auto flex flex-col py-9">
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink href="/">Home</BreadcrumbLink>
					</BreadcrumbItem>
					{segments.map((segment, index) => {
						const href = '/' + segments.slice(0, index + 1).join('/');
						const isLast = index === segments.length - 1;

						return (
							<>
								<BreadcrumbSeparator />
								<BreadcrumbItem key={href}>
									{isLast ? <span>{segment}</span> : <BreadcrumbLink href={href}>{segment}</BreadcrumbLink>}
								</BreadcrumbItem>
							</>
						);
					})}
				</BreadcrumbList>
			</Breadcrumb>
		</div>
	);
}

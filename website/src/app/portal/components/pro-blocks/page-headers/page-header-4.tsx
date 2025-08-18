'use client';

import { FlagSierraLeone } from '@/app/portal/components/pro-blocks/flag-sierra-leone';
import { Badge } from '@/app/portal/components/ui/badge';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/app/portal/components/ui/breadcrumb';
import { Button } from '@/app/portal/components/ui/button';
import { Pen } from 'lucide-react';

export function PageHeader4() {
	return (
		<div className="container mx-auto flex flex-col py-9">
			{/* Breadcrumb navigation */}
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink>Home</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbLink>Settings</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>Profile details</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>

			{/* Main content */}
			<div className="flex flex-wrap items-center gap-4 md:flex-row md:items-center">
				<h1 className="py-8 text-5xl">Profile details</h1>
				<Badge
					variant="outline"
					className="bg-background flex items-center gap-1.5 rounded-full border py-1 pl-1 pr-2.5"
				>
					<FlagSierraLeone />
					<span className="text-foreground text-xs font-medium">Sierra Leone</span>
				</Badge>

				<Button
					variant="outline"
					className="ml-auto rounded-full"
					onClick={() => console.log('Manage program clicked')}
				>
					<Pen className="mr-2 h-4 w-4" />
					Manage program
				</Button>
			</div>
		</div>
	);
}

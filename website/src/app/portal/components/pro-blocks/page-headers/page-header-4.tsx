'use client';

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/app/portal/components/ui/breadcrumb';
import { Input } from '@/app/portal/components/ui/input';
import { Search } from 'lucide-react';

export function PageHeader4() {
	return (
		<div className="container mx-auto flex flex-col">
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
			<div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
				<div className="space-y-2">
					<h1 className="text-2xl font-bold tracking-tight md:text-3xl">Profile details</h1>
					<p className="text-muted-foreground text-sm lg:text-base">
						Manage your profile details such as name, image, description and settings.
					</p>
				</div>
				{/* Search */}
				<div className="relative w-full md:max-w-xs">
					<Search className="text-muted-foreground absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform" />
					<Input type="search" placeholder="Search" className="bg-background pl-8" />
				</div>
			</div>
		</div>
	);
}

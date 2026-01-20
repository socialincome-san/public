import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { Card } from '@/components/card';
import { TabNavigation } from '@/components/tab-navigation';
import type { ReactNode } from 'react';

export default async function Layout({ children }: { children: ReactNode }) {
	const sections = [
		{ href: '/partner-space/recipients', label: 'Recipients' },
		{ href: '/partner-space/candidates', label: 'Candidate Pool' },
	];

	const breadcrumbLinks = [
		{ href: '/', label: 'Website' },
		{ href: '/partner-space', label: 'Partner Space' },
	];

	return (
		<>
			<Breadcrumb links={breadcrumbLinks} />
			<h1 className="py-8 text-5xl">Partner Space</h1>
			<TabNavigation sections={sections} />
			<Card>{children}</Card>
		</>
	);
}

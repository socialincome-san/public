import Link from 'next/link';
import { ReactNode } from 'react';

type AppShellProps = {
	children: ReactNode;
};

const navLinks = [
	{ href: '/portal', label: 'Programs' },
	{ href: '/portal/monitoring', label: 'Monitoring' },
	{ href: '/portal/management', label: 'Management' },
	{ href: '/portal/delivery', label: 'Delivery' },
];

export function AppShell({ children }: AppShellProps) {
	return (
		<div className="flex min-h-screen flex-col">
			{/* Header */}
			<header className="bg-gray-200 p-4">
				<h1 className="text-lg font-bold">
					<Link href="/portal" className="hover:underline">
						My App
					</Link>
				</h1>
			</header>

			{/* Navigation */}
			<nav className="bg-gray-300 p-2">
				<ul className="flex gap-4">
					{navLinks.map((link) => (
						<li key={link.href}>
							<Link href={link.href} className="text-gray-700 hover:text-gray-900 hover:underline">
								{link.label}
							</Link>
						</li>
					))}
				</ul>
			</nav>

			{/* Main Content */}
			<main className="flex-1 p-4">{children}</main>
		</div>
	);
}

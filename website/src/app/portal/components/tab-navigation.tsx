import Link from 'next/link';

export type Section = {
	href: string;
	label: string;
};

type TabNavigationProps = {
	sections: Section[];
};

export function TabNavigation({ sections }: TabNavigationProps) {
	return (
		<nav className="mb-4 border-b border-gray-200">
			<ul className="flex gap-6">
				{sections.map((section) => (
					<li key={section.href}>
						<Link
							href={section.href}
							className="pb-2 text-gray-600 hover:border-b-2 hover:border-blue-500 hover:text-gray-900"
						>
							{section.label}
						</Link>
					</li>
				))}
			</ul>
		</nav>
	);
}

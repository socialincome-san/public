import Link from 'next/link';

type TabNavigationProps = {
	programId: string;
};

export async function TabNavigation({ programId }: TabNavigationProps) {
	const sections = [
		{ slug: 'overview', label: 'Overview' },
		{ slug: 'recipients', label: 'Recipients' },
		{ slug: 'finances', label: 'Finances' },
		{ slug: 'fundraising', label: 'Fundraising' },
		{ slug: 'surveys', label: 'Surveys' },
		{ slug: 'team-members', label: 'Team members' },
	];

	return (
		<nav className="mb-4 border-b border-gray-200">
			<ul className="flex gap-6">
				{sections.map((section) => (
					<li key={section.slug}>
						<Link
							href={`/portal/programs/${programId}/${section.slug}`}
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

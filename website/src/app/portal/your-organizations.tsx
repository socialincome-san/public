import { OrganizationCard } from '@/app/portal/components/organization-card';

type Organization = {
	id: string;
	name: string;
	memberCount: number;
};

type Props = {
	organizations: Organization[];
};

export const YourOrganizations = ({ organizations }: Props) => (
	<section>
		<h2 className="py-6 text-3xl font-medium">Organizations</h2>

		<div className="grid grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-8 pb-8">
			{organizations.map((org) => (
				<OrganizationCard key={org.id} id={org.id} name={org.name} memberCount={org.memberCount} />
			))}
		</div>
	</section>
);

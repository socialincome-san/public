import { Card, CardContent, CardHeader, CardTitle } from '@/app/portal/components/card';
import { Building2 } from 'lucide-react';
import Link from 'next/link';

type OrganizationCardProps = {
	id: string;
	name: string;
	memberCount: number;
};

export const OrganizationCard = ({ id, name, memberCount }: OrganizationCardProps) => (
	<Link href={`/portal/organizations/${id}/members`} className="block h-full">
		<Card className="flex h-full flex-col justify-between p-8 drop-shadow-md transition hover:shadow-sm">
			<CardHeader className="flex flex-row items-center gap-3 p-0">
				<Building2 className="text-muted-foreground h-7 w-7" />
				<CardTitle className="text-2xl font-medium leading-snug">{name}</CardTitle>
			</CardHeader>

			<CardContent className="text-muted-foreground p-0 pt-6 text-sm">
				<p>{memberCount} Members</p>
			</CardContent>
		</Card>
	</Link>
);

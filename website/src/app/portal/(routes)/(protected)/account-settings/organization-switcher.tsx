'use client';

import { Button } from '@/app/portal/components/button';
import { Label } from '@/app/portal/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/portal/components/select';
import type { UserInformation } from '@socialincome/shared/src/database/services/user/user.types';
import { FC, useState, useTransition } from 'react';

type OrganizationSwitcherProps = {
	user: UserInformation;
	setActiveOrganizationAction: (orgId: string) => Promise<void>;
};

export const OrganizationSwitcher: FC<OrganizationSwitcherProps> = ({ user, setActiveOrganizationAction }) => {
	const [isPending, startTransition] = useTransition();
	const [selectedOrg, setSelectedOrg] = useState(user.activeOrganization?.id ?? '');

	const handleSelectChange = (orgId: string) => {
		setSelectedOrg(orgId);
	};

	const handleSave = () => {
		if (!selectedOrg || selectedOrg === user.activeOrganization?.id) {
			return;
		}
		startTransition(() => setActiveOrganizationAction(selectedOrg));
	};

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="org-select">Active organization</Label>
				<Select value={selectedOrg} onValueChange={handleSelectChange} disabled={isPending}>
					<SelectTrigger id="org-select" className="w-full md:w-96">
						<SelectValue placeholder="Select organization" />
					</SelectTrigger>
					<SelectContent>
						{user.organizations.map((org) => (
							<SelectItem key={org.id} value={org.id}>
								{org.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<Button onClick={handleSave} disabled={isPending || !selectedOrg || selectedOrg === user.activeOrganization?.id}>
				{isPending ? 'Saving...' : 'Save'}
			</Button>
		</div>
	);
};

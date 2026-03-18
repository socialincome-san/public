'use client';

import { Badge } from '@/components/badge';
import { OrganizationPermission } from '@/generated/prisma/enums';
import { EyeIcon, PencilIcon } from 'lucide-react';
import { ComponentType } from 'react';

type OrganizationPermissionBadgeProps = {
	permission: OrganizationPermission;
};

const ORGANIZATION_PERMISSION_UI: Record<
	OrganizationPermission,
	{
		variant: 'default' | 'verified' | 'destructive' | 'secondary' | 'outline' | 'outline-solid';
		label: string;
		Icon: ComponentType<{ className?: string }>;
	}
> = {
	edit: { variant: 'verified', label: 'Edit', Icon: PencilIcon },
	readonly: { variant: 'secondary', label: 'Read only', Icon: EyeIcon },
};

export const OrganizationPermissionBadge = ({ permission }: OrganizationPermissionBadgeProps) => {
	const { variant, label, Icon } = ORGANIZATION_PERMISSION_UI[permission];

	return (
		<Badge variant={variant}>
			<Icon className="mr-1 h-4 w-4" />
			{label}
		</Badge>
	);
};

'use client';

import { Badge } from '@/components/badge';
import { UserRole } from '@/generated/prisma/enums';
import { ShieldCheckIcon, UserIcon } from 'lucide-react';
import { ComponentType } from 'react';

type UserRoleBadgeProps = {
	role: UserRole;
};

const USER_ROLE_UI: Record<
	UserRole,
	{
		variant: 'default' | 'verified' | 'destructive' | 'secondary' | 'outline' | 'outline-solid';
		label: string;
		Icon: ComponentType<{ className?: string }>;
	}
> = {
	admin: { variant: 'secondary', label: 'Admin', Icon: ShieldCheckIcon },
	user: { variant: 'default', label: 'User', Icon: UserIcon },
};

export const UserRoleBadge = ({ role }: UserRoleBadgeProps) => {
	const { variant, label, Icon } = USER_ROLE_UI[role];

	return (
		<Badge variant={variant}>
			<Icon className="mr-1 h-4 w-4" />
			{label}
		</Badge>
	);
};

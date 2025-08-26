'use client';

import { Badge } from '@/app/portal/components/badge';
import { RecipientStatus } from '@prisma/client';
import { CheckIcon, CircleSlashIcon, HourglassIcon, ReplyIcon, UserXIcon } from 'lucide-react';
import { ComponentType } from 'react';

type RecipientStatusBadgeProps = {
	status: RecipientStatus;
};

const RECIPIENT_STATUS_UI: Record<
	RecipientStatus,
	{ variant: 'verified' | 'destructive' | 'outline' | 'secondary' | 'default'; label: string; Icon: ComponentType<any> }
> = {
	active: { variant: 'verified', label: 'Active', Icon: CheckIcon },
	suspended: { variant: 'secondary', label: 'Suspended', Icon: CircleSlashIcon },
	waitlisted: { variant: 'outline', label: 'Waitlisted', Icon: HourglassIcon },
	designated: { variant: 'default', label: 'Designated', Icon: ReplyIcon },
	former: { variant: 'destructive', label: 'Former', Icon: UserXIcon },
};

export function RecipientStatusBadge({ status }: RecipientStatusBadgeProps) {
	const { variant, label, Icon } = RECIPIENT_STATUS_UI[status];
	return (
		<Badge variant={variant}>
			<Icon className="mr-1 h-4 w-4" />
			{label}
		</Badge>
	);
}

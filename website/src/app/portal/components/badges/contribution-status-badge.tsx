'use client';

import { Badge } from '@/app/portal/components/badge';
import { ContributionStatus } from '@prisma/client';
import { CheckIcon, HourglassIcon, UserXIcon } from 'lucide-react';
import { ComponentType } from 'react';

type ContributionStatusBadgeProps = {
	status: ContributionStatus;
};

const RECIPIENT_STATUS_UI: Record<
	ContributionStatus,
	{ variant: 'verified' | 'destructive' | 'outline' | 'secondary' | 'default'; label: string; Icon: ComponentType<any> }
> = {
	failed: { variant: 'destructive', label: 'Failed', Icon: UserXIcon },
	pending: { variant: 'outline', label: 'Pending', Icon: HourglassIcon },
	succeeded: { variant: 'verified', label: 'Succeeded', Icon: CheckIcon },
};

export function ContributionStatusBadge({ status }: ContributionStatusBadgeProps) {
	const { variant, label, Icon } = RECIPIENT_STATUS_UI[status];
	return (
		<Badge variant={variant}>
			<Icon className="mr-1 h-4 w-4" />
			{label}
		</Badge>
	);
}

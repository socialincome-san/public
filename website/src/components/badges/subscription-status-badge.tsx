'use client';

import { Badge } from '@/components/badge';
import { ContributionStatus } from '@prisma/client';
import { CheckIcon, HourglassIcon, RefreshCcw, RefreshCwOff, UserXIcon } from 'lucide-react';
import { ComponentType } from 'react';

type SubscriptionStatusBadgeProps = {
	status: 'active' | 'canceled' | 'paused';
	label: string;
};

const SUBSCRIPTION_STATUS_UI: Record<
	SubscriptionStatusBadgeProps['status'],
	{ variant: 'verified' | 'destructive' | 'outline' | 'secondary' | 'default'; Icon: ComponentType<any> }
> = {
	active: { variant: 'verified', Icon: RefreshCcw },
	paused: { variant: 'outline', Icon: HourglassIcon },
	canceled: { variant: 'destructive', Icon: RefreshCwOff },
};

export function SubscriptionStatusBadge({ status, label }: SubscriptionStatusBadgeProps) {
	const { variant, Icon } = SUBSCRIPTION_STATUS_UI[status];
	return (
		<Badge variant={variant}>
			<Icon className="mr-1 h-4 w-4" />
			{label}
		</Badge>
	);
}

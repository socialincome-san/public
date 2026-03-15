'use client';

import { Badge } from '@/components/badge';
import { HourglassIcon, RefreshCcw, RefreshCwOff, TriangleAlert } from 'lucide-react';
import { ComponentType } from 'react';
export type SubscriptionStatus =
	| 'active'
	| 'canceled'
	| 'paused'
	| 'unpaid'
	| 'past_due'
	| 'incomplete'
	| 'incomplete_expired'
	| 'default';
type SubscriptionStatusBadgeProps = {
	status: SubscriptionStatus;
	label: string;
};

const SUBSCRIPTION_STATUS_UI: Record<
	SubscriptionStatusBadgeProps['status'],
	{ variant: 'verified' | 'destructive' | 'outline' | 'outline-solid' | 'default'; Icon: ComponentType<any> | null }
> = {
	active: { variant: 'verified', Icon: RefreshCcw },
	paused: { variant: 'outline', Icon: HourglassIcon },
	canceled: { variant: 'default', Icon: RefreshCwOff },
	unpaid: { variant: 'destructive', Icon: TriangleAlert },
	past_due: { variant: 'destructive', Icon: TriangleAlert },
	incomplete: { variant: 'destructive', Icon: TriangleAlert },
	incomplete_expired: { variant: 'destructive', Icon: TriangleAlert },
	default: { variant: 'default', Icon: null },
};

export const SubscriptionStatusBadge = ({ status, label }: SubscriptionStatusBadgeProps) => {
	const { variant, Icon } = SUBSCRIPTION_STATUS_UI[status] || SUBSCRIPTION_STATUS_UI.default;
	return (
		<Badge variant={variant}>
			{Icon && <Icon className="mr-1 h-4 w-4" />}
			{label}
		</Badge>
	);
};

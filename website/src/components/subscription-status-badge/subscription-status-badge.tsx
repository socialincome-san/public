'use client';

import { Badge } from '@/components/badge/badge';
import { SubscriptionStatus } from '@/generated/prisma/enums';
import { RefreshCcw, RefreshCwOff } from 'lucide-react';
import { ComponentType } from 'react';

type SubscriptionStatusBadgeProps = {
	status: SubscriptionStatus;
	label: string;
};

const SUBSCRIPTION_STATUS_UI: Record<
	SubscriptionStatus,
	{
		variant: 'verified' | 'outline';
		Icon: ComponentType<{ className?: string }>;
	}
> = {
	active: { variant: 'verified', Icon: RefreshCcw },
	ended: { variant: 'outline', Icon: RefreshCwOff },
};

export const SubscriptionStatusBadge = ({ status, label }: SubscriptionStatusBadgeProps) => {
	const { variant, Icon } = SUBSCRIPTION_STATUS_UI[status];

	return (
		<Badge variant={variant}>
			<Icon className="mr-1 h-4 w-4" />
			{label}
		</Badge>
	);
};

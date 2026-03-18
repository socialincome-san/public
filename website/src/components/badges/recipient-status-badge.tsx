'use client';

import { Badge } from '@/components/badge';
import type { RecipientLifecycleStatus } from '@/lib/services/recipient/recipient.types';
import { CheckCircle2Icon, Clock3Icon, PauseCircleIcon, PlayCircleIcon } from 'lucide-react';
import type { ComponentType } from 'react';

type RecipientStatusBadgeProps = {
	status: RecipientLifecycleStatus;
};

const RECIPIENT_STATUS_UI: Record<
	RecipientLifecycleStatus,
	{
		variant: 'default' | 'verified' | 'destructive' | 'secondary' | 'outline' | 'outline-solid';
		label: string;
		Icon: ComponentType<{ className?: string }>;
	}
> = {
	future: { variant: 'outline', label: 'Future', Icon: Clock3Icon },
	active: { variant: 'verified', label: 'Active', Icon: PlayCircleIcon },
	suspended: { variant: 'destructive', label: 'Suspended', Icon: PauseCircleIcon },
	completed: { variant: 'default', label: 'Completed', Icon: CheckCircle2Icon },
};

export const RecipientStatusBadge = ({ status }: RecipientStatusBadgeProps) => {
	const { variant, label, Icon } = RECIPIENT_STATUS_UI[status];

	return (
		<Badge variant={variant}>
			<Icon className="mr-1 h-4 w-4" />
			{label}
		</Badge>
	);
};

'use client';

import { Badge } from '@/app/portal/components/ui/badge';
import type { SurveyStatus } from '@prisma/client';
import { CalendarClockIcon, CheckIcon, CirclePlusIcon, CircleSlashIcon, HourglassIcon, SendIcon } from 'lucide-react';
import type { ComponentType } from 'react';

type SurveyStatusBadgeProps = {
	status: SurveyStatus;
};

const SURVEY_STATUS_UI: Record<
	SurveyStatus,
	{
		variant: 'verified' | 'destructive' | 'outline' | 'secondary' | 'default';
		label: string;
		Icon: ComponentType<any>;
	}
> = {
	new: { variant: 'outline', label: 'New', Icon: CirclePlusIcon },
	sent: { variant: 'secondary', label: 'Sent', Icon: SendIcon },
	scheduled: { variant: 'default', label: 'Scheduled', Icon: CalendarClockIcon },
	in_progress: { variant: 'default', label: 'In Progress', Icon: HourglassIcon },
	completed: { variant: 'verified', label: 'Completed', Icon: CheckIcon },
	missed: { variant: 'destructive', label: 'Missed', Icon: CircleSlashIcon },
};

export function SurveyStatusBadge({ status }: SurveyStatusBadgeProps) {
	const { variant, label, Icon } = SURVEY_STATUS_UI[status];
	return (
		<Badge variant={variant}>
			<Icon className="mr-1 h-4 w-4" />
			{label}
		</Badge>
	);
}

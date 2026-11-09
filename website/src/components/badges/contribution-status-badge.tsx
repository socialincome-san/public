'use client';

import { ContributionStatus } from '@/generated/prisma/enums';
import { Badge } from '@socialincome/design-system/data-display/badge/badge';
import { CheckIcon, HourglassIcon, UserXIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ComponentType } from 'react';

type ContributionStatusBadgeProps = {
	status: ContributionStatus;
};

const RECIPIENT_STATUS_UI: Record<
	ContributionStatus,
	{
		variant: 'verified' | 'destructive' | 'outline' | 'outline-solid' | 'secondary' | 'default';
		Icon: ComponentType<{ className?: string }>;
	}
> = {
	failed: { variant: 'destructive', Icon: UserXIcon },
	pending: { variant: 'outline', Icon: HourglassIcon },
	succeeded: { variant: 'verified', Icon: CheckIcon },
};

export const ContributionStatusBadge = ({ status }: ContributionStatusBadgeProps) => {
	const t = useTranslations('website-me');
	const { variant, Icon } = RECIPIENT_STATUS_UI[status];

	return (
		<Badge variant={variant}>
			<Icon className="mr-1 h-4 w-4" />
			{t(`contributions.status.${status}`)}
		</Badge>
	);
};

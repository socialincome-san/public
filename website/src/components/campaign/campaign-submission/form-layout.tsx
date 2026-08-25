'use client';

import { Card } from '@/components/card/card';
import { cn } from '@/lib/utils/cn';
import type { ReactNode } from 'react';

const formCardClassName = 'border-border rounded-xl border p-6 shadow-sm';

export const CampaignSubmissionFormCard = ({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) => (
	<Card variant="noPadding" className={cn(formCardClassName, className)}>
		{children}
	</Card>
);

export const CampaignSubmissionFormCardColumn = ({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) => (
	<div className={cn('bg-muted min-h-0 flex-1 overflow-y-auto px-6 py-10', className)}>
		<div className="mx-auto flex w-full max-w-[858px] flex-col gap-6">{children}</div>
	</div>
);

'use client';

import { Card } from '@socialincome/design-system/card/card';
import { cn } from '@socialincome/design-system/cn';
import type { ReactNode } from 'react';

const formCardClassName = 'border-border rounded-xl border p-6 shadow-sm';

export const CampaignSubmissionFormCard = ({ children, className }: { children: ReactNode; className?: string }) => (
	<Card variant="noPadding" className={cn(formCardClassName, className)}>
		{children}
	</Card>
);

export const CampaignSubmissionFormCardColumn = ({ children }: { children: ReactNode }) => (
	<div className="bg-muted min-h-0 flex-1 overflow-y-auto px-6 py-10">
		<div className="mx-auto flex w-full max-w-[858px] flex-col gap-6">{children}</div>
	</div>
);

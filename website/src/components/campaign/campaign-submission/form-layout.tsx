'use client';

import { Card } from '@/components/card/card';
import type { ReactNode } from 'react';

const formCardClassName = 'border-border rounded-xl border p-6 shadow-sm';

export const CampaignSubmissionFormCard = ({ children }: { children: ReactNode }) => (
	<Card variant="noPadding" className={formCardClassName}>
		{children}
	</Card>
);

export const CampaignSubmissionFormCardColumn = ({ children }: { children: ReactNode }) => (
	<div className="bg-muted min-h-0 flex-1 overflow-y-auto px-6 py-10">
		<div className="mx-auto flex w-full max-w-[858px] flex-col gap-6">{children}</div>
	</div>
);

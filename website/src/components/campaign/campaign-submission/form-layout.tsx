'use client';

import { Card } from '@socialincome/design-system/card/card';
import type { ReactNode } from 'react';

type Props = {
	children: ReactNode;
	surface?: 'default' | 'gradient';
};

export const CampaignSubmissionFormCard = ({ children, surface }: Props) => (
	<Card padding="compact" elevation="flat" surface={surface}>
		{children}
	</Card>
);

export const CampaignSubmissionFormCardColumn = ({ children }: { children: ReactNode }) => (
	<div className="bg-muted min-h-0 flex-1 overflow-y-auto px-6 py-10">
		<div className="mx-auto flex w-full max-w-[858px] flex-col gap-6">{children}</div>
	</div>
);

'use client';

import { DialogHeader, DialogTitle } from '@/components/dialog';
import { CircleCheck, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type Props = {
	labels: {
		successCreatedTitle: string;
		successLiveTitle: string;
	};
	campaignHref: string;
};

export const CampaignSubmissionContributorSuccess = ({ labels, campaignHref }: Props) => {
	const [campaignUrlLabel, setCampaignUrlLabel] = useState(campaignHref);

	useEffect(() => {
		setCampaignUrlLabel(`${window.location.host}${campaignHref}`);
	}, [campaignHref]);

	return (
		<div className="flex min-h-0 flex-1 flex-col" data-testid="campaign-submission-contributor-success">
			<DialogHeader className="mx-0 shrink-0 px-6 pr-12 text-left">
				<DialogTitle className="leading-snug text-balance">{labels.successCreatedTitle}</DialogTitle>
			</DialogHeader>

			<div className="flex items-center gap-3 px-6 pt-4">
				<CircleCheck className="text-foreground size-12 shrink-0" aria-hidden />
				<div className="flex min-w-0 flex-col gap-1">
					<p className="text-foreground font-bold">{labels.successLiveTitle}</p>
					<Link
						href={campaignHref}
						className="text-foreground inline-flex max-w-full items-center gap-1 text-sm hover:underline"
					>
						<span className="truncate">{campaignUrlLabel}</span>
						<ExternalLink className="size-3.5 shrink-0" aria-hidden />
					</Link>
				</div>
			</div>
		</div>
	);
};

'use client';

import { ContributorCard } from '@/components/open-source/contributor-card';
import type { GithubContributor } from '@/modules/github/github.types';
import { Button } from '@socialincome/design-system/actions/button/button';
import { useState } from 'react';

export type MaxRows = 1 | 2 | 3 | 4;

// The column count changes per breakpoint, so each range hides every child
// after rows × columns. Spelled out because Tailwind only sees literal classes.
const HIDE_AFTER_ROWS: Record<MaxRows, string> = {
	1: 'max-sm:*:nth-[n+2]:hidden sm:max-md:*:nth-[n+3]:hidden md:max-xl:*:nth-[n+4]:hidden xl:max-2xl:*:nth-[n+5]:hidden 2xl:*:nth-[n+6]:hidden',
	2: 'max-sm:*:nth-[n+3]:hidden sm:max-md:*:nth-[n+5]:hidden md:max-xl:*:nth-[n+7]:hidden xl:max-2xl:*:nth-[n+9]:hidden 2xl:*:nth-[n+11]:hidden',
	3: 'max-sm:*:nth-[n+4]:hidden sm:max-md:*:nth-[n+7]:hidden md:max-xl:*:nth-[n+10]:hidden xl:max-2xl:*:nth-[n+13]:hidden 2xl:*:nth-[n+16]:hidden',
	4: 'max-sm:*:nth-[n+5]:hidden sm:max-md:*:nth-[n+9]:hidden md:max-xl:*:nth-[n+13]:hidden xl:max-2xl:*:nth-[n+17]:hidden 2xl:*:nth-[n+21]:hidden',
};

type Props = {
	contributors: GithubContributor[];
	maxRows?: MaxRows;
	showAllLabel: string;
	commitSingularLabel: string;
	commitPluralLabel: string;
};

export const ContributorsList = ({ contributors, maxRows, showAllLabel, commitSingularLabel, commitPluralLabel }: Props) => {
	const [showAll, setShowAll] = useState(false);
	// One column on the smallest screens, so anything beyond maxRows is hidden somewhere.
	const isTruncated = !showAll && maxRows !== undefined && contributors.length > maxRows;

	return (
		<>
			<div
				className={`grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 ${isTruncated ? HIDE_AFTER_ROWS[maxRows] : ''}`}
			>
				{contributors.map((contributor) => (
					<ContributorCard
						key={contributor.id}
						{...contributor}
						commitSingularLabel={commitSingularLabel}
						commitPluralLabel={commitPluralLabel}
					/>
				))}
			</div>
			{isTruncated && (
				<div className="mt-10 flex justify-center">
					<Button variant="outline" onClick={() => setShowAll(true)}>
						{showAllLabel}
					</Button>
				</div>
			)}
		</>
	);
};

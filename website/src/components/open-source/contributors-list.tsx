'use client';

import { Button } from '@/components/button';
import { ContributorCard } from '@/components/open-source/contributor-card';
import type { GithubContributor } from '@/lib/services/github-api/github-api.types';
import { useState } from 'react';

const INITIAL_VISIBLE_COUNT = 16;

type Props = {
	contributors: GithubContributor[];
	heading: string;
	showAllLabel: string;
	commitSingularLabel: string;
	commitPluralLabel: string;
};

export const ContributorsList = ({ contributors, heading, showAllLabel, commitSingularLabel, commitPluralLabel }: Props) => {
	const [showAll, setShowAll] = useState(false);
	const totalContributors = contributors.length;
	const displayedContributors = showAll ? contributors : contributors.slice(0, INITIAL_VISIBLE_COUNT);

	return (
		<section>
			<h2 className="mb-6 text-2xl font-bold">
				{totalContributors} {heading}
			</h2>

			<div className="flex flex-wrap gap-4">
				{displayedContributors.map((contributor) => (
					<ContributorCard
						key={contributor.id}
						{...contributor}
						commitSingularLabel={commitSingularLabel}
						commitPluralLabel={commitPluralLabel}
					/>
				))}
			</div>

			{!showAll && totalContributors > INITIAL_VISIBLE_COUNT ? (
				<div className="mt-8 flex justify-center">
					<Button variant="link" onClick={() => setShowAll(true)}>
						{showAllLabel.replace('{count}', String(totalContributors))}
					</Button>
				</div>
			) : null}
		</section>
	);
};

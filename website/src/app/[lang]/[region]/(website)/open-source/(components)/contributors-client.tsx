'use client';

import {
	Avatar,
	AvatarFallback,
	AvatarImage,
	Button,
	ToggleGroup,
	ToggleGroupItem,
	Typography,
} from '@socialincome/ui';
import { useState } from 'react';

type ContributorProp = {
	name: string;
	commits: number;
	avatarUrl: string;
};

interface Contributor {
	id: number;
	name: string;
	avatarUrl: string;
	commits: number;
}

function Contributor({ name, commits, avatarUrl }: ContributorProp) {
	return (
		<article className="flex min-w-60 flex-row items-center py-2">
			<Avatar className="h-12 w-12 flex-shrink-0">
				<AvatarImage src={avatarUrl} alt={`${name}'s avatar`} />
				<AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
			</Avatar>
			<div className="ml-4 flex flex-col items-start">
				<Typography as="p" size="xl">
					{name}
				</Typography>
				<Typography as="span" size="md" className="text-card-foreground-muted mt-1">
					{commits} {commits === 1 ? 'commit' : 'commits'}
				</Typography>
			</div>
		</article>
	);
}

export function OpenSourceContributorsClient({
	contributorsByCommitCount,
	contributorsByLatestCommit,
	heading,
	totalContributors,
}: {
	contributorsByCommitCount: Contributor[];
	contributorsByLatestCommit: Contributor[];
	heading: string;
	totalContributors: number;
}) {
	const [showAllContributors, setShowAllContributors] = useState(false);
	const [selectedToggle, setSelectedToggle] = useState('commit count');
	const [contributors, setContributors] = useState(contributorsByCommitCount);

	const displayedContributors = showAllContributors ? contributors : contributors.slice(0, 16);

	const handleToggleChange = (value: string) => {
		setSelectedToggle(value);
		if (value === 'latest commit') {
			setContributors(contributorsByLatestCommit);
		} else {
			setContributors(contributorsByCommitCount);
		}
	};

	return (
		<section className="flex flex-col justify-self-start">
			<section>
				<Typography as="h2" size="3xl" lineHeight="snug" className="mb-10">
					{`${totalContributors} ${heading}`}
				</Typography>
			</section>

			<section className="mb-10 flex">
				<ToggleGroup type="single" value={selectedToggle} onValueChange={handleToggleChange}>
					<ToggleGroupItem value="commit count">Commit Count</ToggleGroupItem>
					<ToggleGroupItem value="latest commit">Latest Commit</ToggleGroupItem>
				</ToggleGroup>
			</section>

			<section className="flex flex-wrap gap-4">
				{displayedContributors.map((contributor: Contributor) => (
					<Contributor
						key={contributor.id}
						name={contributor.name}
						commits={contributor.commits}
						avatarUrl={contributor.avatarUrl}
					/>
				))}
			</section>

			{!showAllContributors && totalContributors > 16 && (
				<div className="mt-12 flex justify-center">
					<Button
						variant="link"
						onClick={() => setShowAllContributors(true)}
						className="text-card-foreground mr-20 text-xl"
					>
						{`Show all ${totalContributors} contributors`}
					</Button>
				</div>
			)}
		</section>
	);
}

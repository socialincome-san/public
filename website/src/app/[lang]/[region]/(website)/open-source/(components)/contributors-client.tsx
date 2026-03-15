'use client';

import { Avatar, AvatarFallback, AvatarImage, Button, Typography } from '@socialincome/ui';
import Link from 'next/link';
import { useState } from 'react';

type ContributorProp = {
	name: string;
	commits: number;
	avatarUrl: string;
};
const GITHUB_BASE_URL = 'https://github.com';

const Contributor = ({ name, commits, avatarUrl }: ContributorProp) => {
	return (
		<article className="flex min-w-60 flex-row items-center py-2">
			<Avatar className="h-12 w-12 shrink-0">
				<AvatarImage src={avatarUrl} alt={`${name}'s avatar`} />
				<AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
			</Avatar>
			<div className="ml-4 flex flex-col items-start">
				<Link href={`${GITHUB_BASE_URL}/${name}`}>
					<Typography as="p" size="xl">
						{name}
					</Typography>
				</Link>
				<Typography as="span" size="md" className="text-card-foreground-muted mt-1">
					{commits} {commits === 1 ? 'commit' : 'commits'}
				</Typography>
			</div>
		</article>
	);
};

export const OpenSourceContributorsClient = ({
	contributors,
	heading,
	totalContributors,
}: {
	contributors: Array<{ name: string; commits: number; avatarUrl: string; id: number }>;
	heading: string;
	totalContributors: number;
}) => {
	const [showAllContributors, setShowAllContributors] = useState(false);

	const displayedContributors = showAllContributors ? contributors : contributors.slice(0, 16);

	return (
		<section className="flex flex-col justify-self-start">
			<section>
				<Typography as="h2" size="3xl" lineHeight="snug" className="mb-10">
					{`${totalContributors} ${heading}`}
				</Typography>
			</section>

			<section className="flex flex-wrap gap-4">
				{displayedContributors.map((contributor) => (
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
};

import type { GithubContributor } from '@/lib/services/github-api/github-api.types';
import Image from 'next/image';
import Link from 'next/link';

const GITHUB_BASE_URL = 'https://github.com';
const AVATAR_SIZE = 48;

type Props = GithubContributor & {
	commitSingularLabel: string;
	commitPluralLabel: string;
};

export const ContributorCard = ({ name, commits, avatarUrl, commitSingularLabel, commitPluralLabel }: Props) => {
	const commitLabel = commits === 1 ? commitSingularLabel : commitPluralLabel;

	return (
		<article className="flex min-w-60 items-center gap-4 py-2">
			<Image
				src={avatarUrl}
				alt={`${name}'s avatar`}
				className="size-12 shrink-0 rounded-full object-cover"
				width={AVATAR_SIZE}
				height={AVATAR_SIZE}
			/>
			<div className="flex flex-col items-start">
				<Link
					href={`${GITHUB_BASE_URL}/${name}`}
					target="_blank"
					rel="noopener noreferrer"
					className="text-lg font-medium hover:underline"
				>
					{name}
				</Link>
				<p className="text-muted-foreground text-sm">
					{commits} {commitLabel}
				</p>
			</div>
		</article>
	);
};

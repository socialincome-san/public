import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Avatar, AvatarFallback, AvatarImage, BaseContainer, Typography } from '@socialincome/ui';
import { getContributors } from '../(components)/contributors';

type ContributorProp = {
	name: string;
	commits: number;
	avatarUrl: string;
};

type Metadata = {
	title: string;
	heading: string;
};

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


export async function OpenSourceContributors({ lang }: DefaultParams) {
	const translator = await Translator.getInstance({
			language: lang,
			namespaces: ['website-open-source'],
		});

	const metadata: Metadata = translator.t('metadata');
	const title = metadata.title;
	const heading = metadata.heading;

	const contributors = await getContributors();

	return (
		<BaseContainer className="flex flex-col justify-self-start">
			<section className="">
				<Typography as="h1" size="5xl" weight="bold" className="my-10">
					{title}
				</Typography>
				<Typography as="h2" size="2xl" lineHeight="snug" className="mb-16">
					{`${contributors.length} ${heading}`}
				</Typography>
			</section>
			<section className="flex flex-wrap gap-4">
				{contributors.map((contributor) => (
					<Contributor
						key={contributor.id}
						name={contributor.name}
						commits={contributor.commits}
						avatarUrl={contributor.avatarUrl}
					/>
				))}
			</section>
		</BaseContainer>
	);
}

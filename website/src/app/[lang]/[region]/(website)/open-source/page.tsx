import { DefaultPageProps } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Avatar, AvatarFallback, AvatarImage, BaseContainer, Typography } from '@socialincome/ui';
import { getContributors } from './contributors';

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
		<article className="flex min-w-80 basis-1/5 flex-row items-center justify-between px-3 py-2">
			<Avatar className="max-w-10 basis-1/5">
				<AvatarImage src={avatarUrl} alt={`${name}'s avatar`} />
				<AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
			</Avatar>
			<div className="flex basis-4/5">
				<Typography as="p" size="lg" className="mx-2 self-end text-darkText">
					{name}
				</Typography>
				<Typography as="span" size="xs" className="text-subtleText mt-2 self-center">
					{commits} {commits === 1 ? 'commit' : 'commits'}
				</Typography>
			</div>
		</article>
	);
}

export default async function Page({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({
		language: params.lang,
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
					{heading}
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

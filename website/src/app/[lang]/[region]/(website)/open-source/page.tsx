import { DefaultPageProps } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Avatar, AvatarFallback, AvatarImage, BaseContainer, Typography } from '@socialincome/ui';

type ContributorProp = {
	name: string;
	commits: string;
};

type Contributors = {
	[key: string]: ContributorProp;
};

type Metadata = {
	title: string;
	heading: string;
};

function Contributor({ name, commits }: ContributorProp) {
	return (
		<article className="flex min-w-80 basis-1/5 flex-row items-center justify-between px-3 py-2">
			<Avatar className="max-w-10 basis-1/5">
				<AvatarImage src={'https://github.com/shadcn.png'} />
				<AvatarFallback>CN</AvatarFallback>
			</Avatar>
			<div className="flex basis-4/5">
				<Typography as="p" size="lg" className="mx-2 self-end">
					{name}
				</Typography>
				<Typography as="span" size="xs" className="mt-2 self-center">
					{commits}
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

	const contributors: Contributors = translator.t('contributors');
	const Metadata: Metadata = translator.t('metadata');
	const title = Metadata.title;
	const heading = Metadata.heading;

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
				{Object.entries(contributors).map(([key, contributor]) => (
					<Contributor key={key} {...contributor} />
				))}
			</section>
		</BaseContainer>
	);
}

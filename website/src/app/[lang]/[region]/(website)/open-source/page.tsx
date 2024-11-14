import { DefaultPageProps } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import { OpenSourceContributors } from './(sections)/contributors';
import { Overview } from './(sections)/overview';

type Metadata = {
	title: string;
};

export default async function Page({ params: { lang, region } }: DefaultPageProps) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-open-source'],
	});

	const metadata: Metadata = translator.t('metadata');
	const title = metadata.title;

	return (
		<BaseContainer className="space-y-24">
			<Typography as="h1" size="5xl" weight="bold" className="">
				{title}
			</Typography>
			<Overview lang={lang} region={region} />
			<OpenSourceContributors lang={lang} region={region} />
		</BaseContainer>
	);
}

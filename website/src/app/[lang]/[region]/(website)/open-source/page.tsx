import { DefaultPageProps } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer } from '@socialincome/ui';
import { OpenSourceContributors } from './(sections)/contributors';
import { OpenIssues } from './(sections)/open-issues';
import { Overview } from './(sections)/overview';
import { Hero } from './(sections)/hero';

type Metadata = {
	title: string;
};

export default async function Page({ params: { lang, region } }: DefaultPageProps) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-open-source'],
	});
	
	return (
		<BaseContainer className="space-y-12">
			<Hero lang={lang} region={region} />
			<Overview lang={lang} region={region} />
			<OpenSourceContributors lang={lang} region={region} />
			<OpenIssues lang={lang} region={region} />
		</BaseContainer>
	);
}

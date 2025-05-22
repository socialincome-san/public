import { DefaultPageProps } from '@/app/[lang]/[region]';
import { BaseContainer } from '@socialincome/ui';
import { OpenSourceContributors } from './(sections)/contributors';
import { Hero } from './(sections)/hero';
import { OpenIssues } from './(sections)/open-issues';
import { Overview } from './(sections)/overview';

export default async function Page(props: DefaultPageProps) {
	const params = await props.params;

	const { lang, region } = params;

	return (
		<BaseContainer className="space-y-12">
			<Hero lang={lang} region={region} />
			<Overview lang={lang} region={region} />
			<OpenSourceContributors lang={lang} region={region} />
			<OpenIssues lang={lang} region={region} />
		</BaseContainer>
	);
}

import { BlockWrapper } from '@/components/block-wrapper';
import { ContributorsList } from '@/components/open-source/contributors-list';
import { IssuesList } from '@/components/open-source/issues-list';
import { StatsOverview } from '@/components/open-source/stats-overview';
import type { OpenSource } from '@/generated/storyblok/types/109655/storyblok-components';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import { EMPTY_GITHUB_OPEN_SOURCE_PAGE_DATA } from '@/lib/services/github-api/github-api.types';
import { services } from '@/lib/services/services';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';

type Props = {
	blok: OpenSource;
	lang: WebsiteLanguage;
};

type OverviewLabels = {
	forks: { title: string; time: string };
	commits: { title: string; time: string };
	stars: { title: string; time: string };
};

type IssuesLabels = {
	title: string;
	header: string;
	link: string;
	filter: string;
	showAll: string;
	empty: string;
};

type ContributorsLabels = {
	heading: string;
	showAll: string;
	commitSingular: string;
	commitPlural: string;
};

export const OpenSourceBlock = async ({ blok, lang }: Props) => {
	const [githubResult, translator] = await Promise.all([
		services.githubApi.getOpenSourcePageData(),
		Translator.getInstance({ language: lang, namespaces: ['website-open-source'] }),
	]);

	const { stats, contributors, issues, labels } = githubResult.success
		? githubResult.data
		: EMPTY_GITHUB_OPEN_SOURCE_PAGE_DATA;

	const overviewLabels = translator.t<OverviewLabels>('overview');
	const contributorsLabels = translator.t<ContributorsLabels>('contributors');
	const issuesLabels = translator.t<IssuesLabels>('issues');
	const errorMessage = translator.t<string>('error.unavailable');

	return (
		<BlockWrapper className="space-y-12 md:space-y-16" {...storyblokEditable(blok as SbBlokData)}>
			{!githubResult.success ? (
				<p className="text-muted-foreground text-center" role="status">
					{errorMessage}
				</p>
			) : null}

			<StatsOverview
				stats={stats}
				commitsLabel={overviewLabels.commits.title}
				starsLabel={overviewLabels.stars.title}
				forksLabel={overviewLabels.forks.title}
				periodLabel={overviewLabels.commits.time}
				lang={lang}
			/>

			<ContributorsList
				contributors={contributors}
				heading={contributorsLabels.heading}
				showAllLabel={contributorsLabels.showAll}
				commitSingularLabel={contributorsLabels.commitSingular}
				commitPluralLabel={contributorsLabels.commitPlural}
			/>

			<IssuesList
				title={issuesLabels.title}
				issues={issues}
				labels={labels}
				tableHeaderLabel={issuesLabels.header}
				issueLinkLabel={issuesLabels.link}
				filterAllLabel={issuesLabels.filter}
				showAllLabel={issuesLabels.showAll}
				emptyLabel={issuesLabels.empty}
			/>
		</BlockWrapper>
	);
};

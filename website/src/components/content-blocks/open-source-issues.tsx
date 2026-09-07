import { BlockWrapper } from '@/components/block-wrapper';
import { IssuesList } from '@/components/open-source/issues-list';
import { OpenSourceUnavailableMessage } from '@/components/open-source/unavailable-message';
import type { OpenSourceIssues } from '@/generated/storyblok/types/109655/storyblok-components';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import { EMPTY_GITHUB_OPEN_SOURCE_ISSUES_DATA } from '@/lib/services/github-api/github-api.types';
import { services } from '@/lib/services/services';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';

type Props = {
	blok: OpenSourceIssues;
	lang: WebsiteLanguage;
};

type IssuesLabels = {
	title: string;
	header: string;
	link: string;
	filter: string;
	showAll: string;
	empty: string;
};

export const OpenSourceIssuesBlock = async ({ blok, lang }: Props) => {
	const [issuesResult, translator] = await Promise.all([
		services.githubApi.getOpenSourceIssues(),
		Translator.getInstance({ language: lang, namespaces: ['website-open-source'] }),
	]);

	const { issues, labels } = issuesResult.success ? issuesResult.data : EMPTY_GITHUB_OPEN_SOURCE_ISSUES_DATA;
	const issuesLabels = translator.t<IssuesLabels>('issues');
	const errorMessage = translator.t<string>('error.unavailable');

	return (
		<BlockWrapper {...storyblokEditable(blok as SbBlokData)}>
			{!issuesResult.success ? <OpenSourceUnavailableMessage message={errorMessage} /> : null}

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

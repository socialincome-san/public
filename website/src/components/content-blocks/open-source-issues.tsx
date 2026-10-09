import { IssuesList } from '@/components/open-source/issues-list';
import { OpenSourceUnavailableMessage } from '@/components/open-source/unavailable-message';
import type { OpenSourceIssues } from '@/generated/storyblok/types/109655/storyblok-components';
import { getOpenSourceIssuesAction } from '@/modules/github/github.actions';
import { EMPTY_GITHUB_OPEN_SOURCE_ISSUES_DATA } from '@/modules/github/github.types';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { storyblokEditable } from '@storyblok/react';
import { getTranslations } from 'next-intl/server';

type Props = {
	blok: OpenSourceIssues;
};

export const OpenSourceIssuesBlock = async ({ blok }: Props) => {
	const [issuesResult, t] = await Promise.all([getOpenSourceIssuesAction(), getTranslations('website-open-source')]);

	const { issues, labels } = issuesResult.success ? issuesResult.data : EMPTY_GITHUB_OPEN_SOURCE_ISSUES_DATA;
	const errorMessage = t('error.unavailable');

	return (
		<BlockWrapper {...storyblokEditable(blok)}>
			{!issuesResult.success ? <OpenSourceUnavailableMessage message={errorMessage} /> : null}

			<IssuesList
				title={t('issues.title')}
				issues={issues}
				labels={labels}
				tableHeaderLabel={t('issues.header')}
				issueLinkLabel={t('issues.link')}
				filterAllLabel={t('issues.filter')}
				emptyLabel={t('issues.empty')}
			/>
		</BlockWrapper>
	);
};

import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { getIssuesData } from '../(components)/get-issues';
import { IssueClient } from '../(components)/issues-client';

type Issues = {
	title: string;
	header: string;
	link: string;
	filter: string;
};

export const OpenIssues = async ({ lang }: DefaultParams) => {
	const translator = await Translator.getInstance({
		language: lang as WebsiteLanguage,
		namespaces: ['website-open-source'],
	});

	const issuesMeta: Issues = translator.t('issues');
	const title = issuesMeta.title;
	const tableHeader = issuesMeta.header;
	const linkText = issuesMeta.link;
	const filterText = issuesMeta.filter;

	const { issues, labels } = await getIssuesData();

	return (
		<IssueClient
			title={title}
			issues={issues}
			labels={labels}
			tableHeader={tableHeader}
			linkText={linkText}
			filterText={filterText}
		/>
	);
};

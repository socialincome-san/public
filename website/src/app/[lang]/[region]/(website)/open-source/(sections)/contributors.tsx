import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { OpenSourceContributorsClient } from '../(components)/contributors-client';
import { getContributors } from '../(components)/get-contributors';

type Metadata = {
	heading: string;
};

export async function OpenSourceContributors({ lang }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-open-source'],
	});

	const metadata: Metadata = translator.t('metadata');
	const heading = metadata.heading;

	const contributors = await getContributors();
	const totalContributors = contributors.length;

	return (
		<OpenSourceContributorsClient contributors={contributors} heading={heading} totalContributors={totalContributors} />
	);
}

export default OpenSourceContributors;

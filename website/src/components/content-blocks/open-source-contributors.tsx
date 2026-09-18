import { BlockWrapper } from '@/components/block-wrapper';
import { ContributorsList } from '@/components/open-source/contributors-list';
import { OpenSourceUnavailableMessage } from '@/components/open-source/unavailable-message';
import type { OpenSourceContributors } from '@/generated/storyblok/types/109655/storyblok-components';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';

type Props = {
	blok: OpenSourceContributors;
	lang: WebsiteLanguage;
};

type ContributorsLabels = {
	heading: string;
	showAll: string;
	commitSingular: string;
	commitPlural: string;
};

export const OpenSourceContributorsBlock = async ({ blok, lang }: Props) => {
	const [contributorsResult, translator] = await Promise.all([
		services.githubApi.getOpenSourceContributors(),
		Translator.getInstance({ language: lang, namespaces: ['website-open-source'] }),
	]);

	const contributors = contributorsResult.success ? contributorsResult.data : [];
	const contributorsLabels = translator.t<ContributorsLabels>('contributors');
	const errorMessage = translator.t<string>('error.unavailable');

	return (
		<BlockWrapper {...storyblokEditable(blok as SbBlokData)}>
			{!contributorsResult.success ? <OpenSourceUnavailableMessage message={errorMessage} /> : null}

			<ContributorsList
				contributors={contributors}
				heading={contributorsLabels.heading}
				showAllLabel={contributorsLabels.showAll}
				commitSingularLabel={contributorsLabels.commitSingular}
				commitPluralLabel={contributorsLabels.commitPlural}
			/>
		</BlockWrapper>
	);
};

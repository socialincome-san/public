import { ContributorsList } from '@/components/open-source/contributors-list';
import { OpenSourceUnavailableMessage } from '@/components/open-source/unavailable-message';
import type { OpenSourceContributors } from '@/generated/storyblok/types/109655/storyblok-components';
import { getOpenSourceContributorsAction } from '@/modules/github/github.actions';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { storyblokEditable } from '@storyblok/react';
import { getTranslations } from 'next-intl/server';

type Props = {
	blok: OpenSourceContributors;
};

export const OpenSourceContributorsBlock = async ({ blok }: Props) => {
	const [contributorsResult, t] = await Promise.all([
		getOpenSourceContributorsAction(),
		getTranslations('website-open-source'),
	]);

	const contributors = contributorsResult.success ? contributorsResult.data : [];
	const errorMessage = t('error.unavailable');

	return (
		<BlockWrapper {...storyblokEditable(blok)}>
			{!contributorsResult.success ? <OpenSourceUnavailableMessage message={errorMessage} /> : null}

			<ContributorsList
				contributors={contributors}
				heading={t('contributors.heading')}
				commitSingularLabel={t('contributors.commitSingular')}
				commitPluralLabel={t('contributors.commitPlural')}
			/>
		</BlockWrapper>
	);
};

import { blockMargins } from '@/components/content-blocks/block-margins';
import { ContributorsList, type MaxRows } from '@/components/open-source/contributors-list';
import { OpenSourceUnavailableMessage } from '@/components/open-source/unavailable-message';
import type { OpenSourceContributors } from '@/generated/storyblok/types/109655/storyblok-components';
import { getOpenSourceContributorsAction } from '@/modules/github/github.actions';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { storyblokEditable } from '@storyblok/react';
import { getTranslations } from 'next-intl/server';

const MAX_ROWS: MaxRows[] = [1, 2, 3, 4];

type Props = {
	blok: OpenSourceContributors;
};

export const OpenSourceContributorsBlock = async ({ blok }: Props) => {
	const [contributorsResult, t] = await Promise.all([
		getOpenSourceContributorsAction(),
		getTranslations('website-open-source'),
	]);

	const contributors = contributorsResult.success ? contributorsResult.data : [];
	const maxRows = MAX_ROWS.find((rows) => String(rows) === blok.maxRows);

	return (
		<BlockWrapper {...blockMargins(blok)} {...storyblokEditable(blok)}>
			{!contributorsResult.success ? <OpenSourceUnavailableMessage message={t('error.unavailable')} /> : null}

			<ContributorsList
				contributors={contributors}
				maxRows={maxRows}
				showAllLabel={t('contributors.showAll', { count: contributors.length })}
				commitSingularLabel={t('contributors.commitSingular')}
				commitPluralLabel={t('contributors.commitPlural')}
			/>
		</BlockWrapper>
	);
};

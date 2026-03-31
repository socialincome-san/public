import { resolveSelectedStories } from '@/components/content-blocks/overview-grid.utils';
import { FocusesOverview } from '@/components/storyblok/focus/focuses-overview';
import { getFocusId } from '@/components/storyblok/focus/focus.utils';
import { BlockWrapper } from '@/components/block-wrapper';
import type { FocusGrid } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';

type Props = {
	blok: FocusGrid;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const FocusGridBlock = async ({ blok, lang, region }: Props) => {
	const focusesResult = await services.storyblok.getFocuses(lang);
	const allFocuses = focusesResult.success ? focusesResult.data : [];
	const focuses = blok.showAllFocuses ? allFocuses : resolveSelectedStories(blok.focuses, allFocuses);
	const focusIds = [...new Set(focuses.map((focus) => getFocusId(focus.content)).filter(Boolean))];
	const statsResult = await services.read.focus.getPublicFocusStatsByIds(focusIds);
	const statsById = statsResult.success ? statsResult.data : {};

	return (
		<BlockWrapper {...storyblokEditable(blok as SbBlokData)}>
			<FocusesOverview focuses={focuses} statsById={statsById} lang={lang} region={region} />
		</BlockWrapper>
	);
};


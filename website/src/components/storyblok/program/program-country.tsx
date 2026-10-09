import { MapRectangle } from '@/components/storyblok/country/map-rectangle';
import type { ResolvedProgramCountry } from '@/components/storyblok/country/resolve-country-name';
import { RichTextRenderer } from '@/components/storyblok/rich-text-renderer';
import { LinkPill } from '@socialincome/design-system/actions/link-pill/link-pill';
import { DetailPanel } from '@socialincome/design-system/data-display/detail-panel/detail-panel';
import { getTranslations } from 'next-intl/server';

type Props = {
	resolvedCountry: ResolvedProgramCountry;
};

export const ProgramCountry = async ({ resolvedCountry }: Props) => {
	const t = await getTranslations('website-common');
	const { isoCode, name, description, href } = resolvedCountry;

	return (
		<DetailPanel title={name} media={<MapRectangle isoCode={isoCode} countryName={name} />}>
			{description ? (
				<div className="text-foreground prose line-clamp-8 max-w-none text-base">
					<RichTextRenderer richTextDocument={description} />
				</div>
			) : null}
			{href ? <LinkPill href={href} label={t('program-detail-page.country-analysis')} /> : null}
		</DetailPanel>
	);
};

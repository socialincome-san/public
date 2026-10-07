import { MapRectangle } from '@/components/storyblok/country/map-rectangle';
import type { ResolvedProgramCountry } from '@/components/storyblok/country/resolve-country-name';
import { RichTextRenderer } from '@/components/storyblok/rich-text-renderer';
import type { Translator } from '@/lib/i18n/translator';
import { LinkPill } from '@socialincome/design-system/actions/link-pill/link-pill';
import { DetailPanel } from '@socialincome/design-system/data-display/detail-panel/detail-panel';

type Props = {
	resolvedCountry: ResolvedProgramCountry;
	translator: Translator;
};

export const ProgramCountry = ({ resolvedCountry, translator }: Props) => {
	const { isoCode, name, description, href } = resolvedCountry;

	return (
		<DetailPanel title={name} media={<MapRectangle isoCode={isoCode} countryName={name} />}>
			{description ? (
				<div className="text-foreground prose line-clamp-8 max-w-none text-base">
					<RichTextRenderer richTextDocument={description} />
				</div>
			) : null}
			{href ? <LinkPill href={href} label={translator.t('program-detail-page.country-analysis')} /> : null}
		</DetailPanel>
	);
};

import { MapRectangle } from '@/components/storyblok/country/map-rectangle';
import type { ResolvedProgramCountry } from '@/components/storyblok/country/resolve-country-name';
import { ProgramDetailPill } from '@/components/storyblok/program/program-detail-pill';
import { RichTextRenderer } from '@/components/storyblok/rich-text-renderer';
import type { Translator } from '@/lib/i18n/translator';

type Props = {
	resolvedCountry: ResolvedProgramCountry;
	translator: Translator;
};

export const ProgramCountry = ({ resolvedCountry, translator }: Props) => {
	const { isoCode, name, description, href } = resolvedCountry;

	return (
		<div className="flex flex-col items-stretch overflow-hidden rounded-xl bg-white p-3 shadow-lg md:flex-row md:py-3 md:pr-3 md:pl-0">
			<div className="flex flex-1 flex-col items-start gap-5 px-7 pt-5 pb-2 md:px-10 md:pt-8">
				<h2 className="text-foreground text-xl font-bold">{name}</h2>
				{description ? (
					<div className="text-foreground prose prose-gray max-w-none flex-1 text-base">
						<RichTextRenderer richTextDocument={description} />
					</div>
				) : null}
				{href ? <ProgramDetailPill href={href} label={translator.t('program-detail-page.country-analysis')} /> : null}
			</div>
			<div className="mt-5 h-[341px] w-full shrink-0 md:mt-0 md:w-[274px]">
				<MapRectangle isoCode={isoCode} countryName={name} />
			</div>
		</div>
	);
};

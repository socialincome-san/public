import { BlockWrapper } from '@/components/block-wrapper';
import { RichTextRenderer } from '@/components/storyblok/rich-text-renderer';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import type { CountryStory } from './country.types';
import { getCountryDescription, getCountryIsoCode, getCountryTitle } from './country.utils';
import { MapBubble } from './map-bubble';

type Props = {
	country: CountryStory;
	lang: WebsiteLanguage;
};

export const CountryMap = async ({ country, lang }: Props) => {
	const isoCode = getCountryIsoCode(country.content);
	if (isoCode === '-') {
		return null;
	}

	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });
	const countryTitle = getCountryTitle(country.content);
	const countryDescription = getCountryDescription(country.content);

	return (
		<BlockWrapper>
			<div className="flex flex-col gap-8 lg:grid lg:grid-cols-2 lg:items-start lg:gap-12">
				<div className="flex justify-center lg:justify-start">
					<MapBubble isoCode={isoCode} countryName={countryTitle} />
				</div>
				<div className="flex flex-col gap-4">
					<h2 className="text-4xl font-semibold md:text-3xl">{`${translator.t('countries-page.about')} ${countryTitle}`}</h2>
					<div className="prose prose-gray max-w-none text-base">
						<RichTextRenderer richTextDocument={countryDescription} />
					</div>
				</div>
			</div>
		</BlockWrapper>
	);
};

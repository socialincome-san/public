import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { BaseContainer } from '@socialincome/ui';
import { CarouselCardProps, QuotesCarousel } from '../(components)/quotes-carousel';

export async function Quotes({ lang }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang as WebsiteLanguage,
		namespaces: ['website-home', 'common'],
	});

	const cards = translator.t<CarouselCardProps>('section-8.cards');

	return (
		<BaseContainer className="my-40">
			<QuotesCarousel {...cards} />
		</BaseContainer>
	);
}

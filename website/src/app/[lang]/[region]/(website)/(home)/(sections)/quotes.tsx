import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer } from '@socialincome/ui';
import { CarouselCardProps, QuotesCarousel } from '../(components)/quotes-carousel';

export async function Quotes({ lang }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-home', 'common'],
	});

	const cards = translator.t<CarouselCardProps>('section-8.cards');

	return (
		<BaseContainer className="my-40">
			<QuotesCarousel {...cards} />
		</BaseContainer>
	);
}

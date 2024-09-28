import { DefaultParams } from '@/app/[lang]/[region]';
import carlosImg from '@/app/[lang]/[region]/(website)/our-work/(assets)/carlos.jpg';
import claudiaImage from '@/app/[lang]/[region]/(website)/our-work/(assets)/claudia.jpg';
import hanImage from '@/app/[lang]/[region]/(website)/our-work/(assets)/han.jpg';
import rubenImage from '@/app/[lang]/[region]/(website)/our-work/(assets)/ruben.jpg';
import vanjaImg from '@/app/[lang]/[region]/(website)/our-work/(assets)/vanja.jpg';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer } from '@socialincome/ui';
import { ContributorsCarousel } from '../(components)/contributors-carousel';

export async function Testimonials({ lang }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['countries', 'website-our-work'],
	});

	return (
		<BaseContainer className="my-16">
			<ContributorsCarousel
				portraits={[
					{
						name: 'Carlos',
						image: carlosImg,
						text: translator.t('contributors.portraits.carlos'),
						country: translator.t('US'),
					},
					{
						name: 'Vanja',
						image: vanjaImg,
						text: translator.t('contributors.portraits.vanja'),
						country: translator.t('CH'),
					},
					{
						name: 'Ruben',
						image: rubenImage,
						text: translator.t('contributors.portraits.ruben'),
						country: translator.t('CH'),
					},
					{
						name: 'Han',
						image: hanImage,
						text: translator.t('contributors.portraits.han'),
						country: translator.t('US'),
					},
					{
						name: 'Claudia',
						image: claudiaImage,
						text: translator.t('contributors.portraits.claudia'),
						country: translator.t('CH'),
					},
				]}
			/>
		</BaseContainer>
	);
}

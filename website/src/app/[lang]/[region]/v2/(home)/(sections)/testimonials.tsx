import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer } from '@socialincome/ui';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import avatarImgData from '../(assets)/avatarImgData.jpg';
import { ContributorsPeopleCarouselv2 } from '../(components)/contributors-people-carousel';

type PortraitProps = {
	name: string;
	text: string;
	country: string;
	image: string | StaticImport;
};

export async function Testimonials({ lang, region }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-home2', 'common'],
	});

	const portrait: PortraitProps[] = [
		{
			name: 'Vanja',
			text: "It's a great example of redistribution of wealth based on solidarity and enabled by today's technology.",
			country: 'Switzerland',
			image: avatarImgData,
		},
		{
			name: 'Vanja',
			text: "It's a great example of redistribution of wealth based on solidarity and enabled by today's technology.",
			country: 'Switzerland',
			image: avatarImgData,
		},
		{
			name: 'Vanja',
			text: "It's a great example of redistribution of wealth based on solidarity and enabled by today's technology.",
			country: 'Switzerland',
			image: avatarImgData,
		},
		{
			name: 'Vanja',
			text: "It's a great example of redistribution of wealth based on solidarity and enabled by today's technology.",
			country: 'Switzerland',
			image: avatarImgData,
		},
	];

	return (
<<<<<<< HEAD
		<BaseContainer className="my-16">
=======
		<BaseContainer className="mt-10">
>>>>>>> 589d624f16008bf4ee68128fadcfc44528aa5c62
			<ContributorsPeopleCarouselv2 portraits={portrait} />
		</BaseContainer>
	);
}

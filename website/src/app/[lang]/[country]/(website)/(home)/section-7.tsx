import { DefaultPageProps } from '@/app/[lang]/[country]';
import { Section7Carousel } from '@/app/[lang]/[country]/(website)/(home)/section-7-carousel';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';

export default async function Section7({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['website-home'],
	});

	return (
		<BaseContainer backgroundColor="bg-red-50" className="flex flex-col justify-center space-y-8 py-20 sm:min-h-screen">
			<p>
				<Typography as="span" size="4xl" weight="bold" lineHeight="relaxed">
					{translator.t('section-7.title-1')}
				</Typography>
				<Typography as="span" size="4xl" weight="bold" lineHeight="relaxed" color="secondary">
					{translator.t('section-7.title-2')}
				</Typography>
			</p>
			<Typography size="2xl" weight="medium">
				{translator.t('section-7.subtitle')}
			</Typography>
			<Section7Carousel />
		</BaseContainer>
	);
}

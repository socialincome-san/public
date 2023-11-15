import { Section7Carousel } from '@/app/[lang]/[region]/(website)/(home)/section-7-carousel';
import { WebsiteLanguage } from '@/i18n';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';

export async function Section7({ lang }: { lang: WebsiteLanguage }) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-home'],
	});

	return (
		<BaseContainer
			backgroundColor="bg-red-50"
			className="flex min-h-screen flex-col justify-center space-y-8 py-16 md:py-32"
		>
			<p>
				<Typography as="span" size="4xl" weight="bold">
					{translator.t('section-7.title-1')}
				</Typography>
				<Typography as="span" size="4xl" weight="bold" color="secondary">
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

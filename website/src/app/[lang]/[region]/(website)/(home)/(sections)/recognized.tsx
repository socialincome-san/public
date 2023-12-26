import { RecognizedCarousel } from '@/app/[lang]/[region]/(website)/(home)/(sections)/recognized-carousel';
import { WebsiteLanguage } from '@/i18n';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';

export async function Recognized({ lang }: { lang: WebsiteLanguage }) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-home'],
	});

	return (
		<BaseContainer
			backgroundColor="bg-red-50"
			className="flex min-h-screen flex-col justify-center space-y-8 py-16 md:py-32"
		>
			<Typography>
				<Typography as="span" size="4xl" weight="bold">
					{translator.t('section-7.title-1')}
				</Typography>
				<Typography as="span" size="4xl" weight="bold" color="secondary">
					{translator.t('section-7.title-2')}
				</Typography>
			</Typography>
			<Typography size="lg">{translator.t('section-7.subtitle')}</Typography>
			<RecognizedCarousel />
		</BaseContainer>
	);
}

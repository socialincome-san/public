import { SdgCard } from '@/app/[lang]/[region]/(website)/(home)/(sections)/sdg-card';
import { WebsiteLanguage } from '@/i18n';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';

export async function Sdg({ lang }: { lang: WebsiteLanguage }) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-home'],
	});

	return (
		<BaseContainer backgroundColor="bg-yellow-50" className="flex min-h-screen flex-col justify-center py-16 md:py-32">
			<Typography>
				<Typography as="span" size="4xl" weight="bold">
					{translator.t('section-6.title-1')}
				</Typography>
				<Typography as="span" size="4xl" weight="bold" color="secondary">
					{translator.t('section-6.title-2')}
				</Typography>
			</Typography>
			<div className="mt-16 grid grid-cols-1 gap-4">
				<SdgCard
					title={translator.t('section-6.card-1.title')}
					description={translator.t('section-6.card-1.description')}
					paragraphs={[translator.t('section-6.card-1.paragraph-1')]}
				/>
				<SdgCard
					title={translator.t('section-6.card-2.title')}
					description={translator.t('section-6.card-2.description')}
					paragraphs={[translator.t('section-6.card-2.paragraph-1')]}
				/>
			</div>
		</BaseContainer>
	);
}

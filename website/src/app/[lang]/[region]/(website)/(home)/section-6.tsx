import { WebsiteLanguage } from '@/i18n';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import { SectionCard } from './section-6-card';

export async function Section6({ lang }: { lang: WebsiteLanguage }) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-home'],
	});

	return (
		<BaseContainer backgroundColor="bg-yellow-50" className="flex min-h-screen flex-col justify-center py-16 md:py-32">
			<p>
				<Typography as="span" size="4xl" weight="bold">
					{translator.t('section-6.title-1')}
				</Typography>
				<Typography as="span" size="4xl" weight="bold" color="secondary">
					{translator.t('section-6.title-2')}
				</Typography>
			</p>
			<div className="mt-16 grid grid-cols-1 gap-4">
				<SectionCard
					title={translator.t('section-6.card-1.title')}
					description={translator.t('section-6.card-1.description')}
					paragraphs={[translator.t('section-6.card-2.paragraph-1')]}
				/>
				<SectionCard
					title={translator.t('section-6.card-2.title')}
					description={translator.t('section-6.card-2.description')}
					paragraphs={[translator.t('section-6.card-2.paragraph-1')]}
				/>
			</div>
		</BaseContainer>
	);
}

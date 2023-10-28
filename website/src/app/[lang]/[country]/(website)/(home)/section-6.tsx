import { DefaultPageProps } from '@/app/[lang]/[country]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import { SectionCard } from './section-6-card';

export default async function Section6({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['website-home'],
	});

	return (
		<BaseContainer backgroundColor="bg-yellow-50" className="flex min-h-screen flex-col justify-center py-20">
			<p className="mb-8 lg:mb-16">
				<Typography as="span" size="4xl" weight="bold" lineHeight="relaxed">
					{translator.t('section-6.title-1')}
				</Typography>
				<Typography as="span" size="4xl" weight="bold" lineHeight="relaxed" color="secondary">
					{translator.t('section-6.title-2')}
				</Typography>
			</p>
			<div className="grid-rows-5s-1 grid gap-4 md:grid-rows-2 lg:grid-rows-3">
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

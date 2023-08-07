import { DefaultPageProps } from '@/app/[lang]/[country]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import { SectionCardSix } from './section-6-card';

export default async function Section6({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['website-home'],
	});

	return (
		<BaseContainer className="bg-base-red">
			<div className="flex min-h-screen flex-col  justify-center py-20">
				<p className="mb-8 lg:mb-16">
					<Typography as="span" size="4xl" weight="bold" lineHeight="relaxed">
						{translator.t('section-6.title-1')}
					</Typography>
					<Typography as="span" size="4xl" weight="bold" lineHeight="relaxed" color="accent">
						{translator.t('section-6.title-2')}
					</Typography>
				</p>
				<div className="grid-rows-5s-1 grid gap-4 md:grid-rows-2 lg:grid-rows-3">
					<SectionCardSix
						titles={{
							main: translator.t('section-6.card-1.title'),
							articles: translator.t('section-6.articles'),
							faqs: translator.t('section-6.faqs'),
						}}
						items={[translator.t('section-6.card-1.item-1')]}
						paragraphs={[translator.t('section-5.card-2.paragraph-1')]}
						articles={[
							{
								title: translator.t('section-5.card-1.article-1-title'),
								author: translator.t('section-5.card-1.article-1-author'),
								link: translator.t('section-5.card-1.article-1-link'),
							},
						]}
					/>

					<SectionCardSix
						titles={{
							main: translator.t('section-6.card-2.title'),
							articles: translator.t('section-6.articles'),
							faqs: translator.t('section-6.faqs'),
						}}
						items={[translator.t('section-6.card-2.item-1')]}
						paragraphs={[translator.t('section-6.card-2.paragraph-1')]}
						articles={[
							{
								title: translator.t('section-6.card-2.article-1-title'),
								author: translator.t('section-6.card-2.article-1-author'),
								link: translator.t('section-6.card-2.article-1-link'),
							},
						]}
					/>
				</div>
			</div>
		</BaseContainer>
	);
}

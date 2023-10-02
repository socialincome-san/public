import { DefaultPageProps } from '@/app/[lang]/[country]';
import { SectionCard } from '@/app/[lang]/[country]/(website)/(home)/section-5-card';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';

export default async function Section5({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['website-home', 'website-common'],
	});

	return (
		<BaseContainer>
			<div className="flex min-h-screen flex-col justify-center space-y-8">
				<Typography as="h2" size="4xl" weight="bold">
					{translator?.t('section-5.title')}
				</Typography>
				<div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
					<SectionCard
						titles={{
							main: translator.t('section-5.card-1.title'),
							articles: translator.t('section-5.articles'),
							faqs: translator.t('section-5.faqs'),
						}}
						items={[
							translator.t('section-5.card-1.item-1'),
							translator.t('section-5.card-1.item-2'),
							translator.t('section-5.card-1.item-3'),
							translator.t('section-5.card-1.item-4'),
						]}
						paragraphs={[translator.t('section-5.card-1.paragraph-1'), translator.t('section-5.card-1.paragraph-2')]}
						articles={[
							{
								title: translator.t('section-5.card-1.article-1-title'),
								author: translator.t('section-5.card-1.article-1-author'),
								link: translator.t('section-5.card-1.article-1-link'),
							},
							{
								title: translator.t('section-5.card-1.article-2-title'),
								author: translator.t('section-5.card-1.article-2-author'),
								link: translator.t('section-5.card-1.article-2-link'),
							},
							{
								title: translator.t('section-5.card-1.article-3-title'),
								author: translator.t('section-5.card-1.article-3-author'),
								link: translator.t('section-5.card-1.article-3-link'),
							},
							{
								title: translator.t('section-5.card-1.article-4-title'),
								author: translator.t('section-5.card-1.article-4-author'),
								link: translator.t('section-5.card-1.article-4-link'),
							},
						]}
						faqs={[
							{
								question: translator.t('section-5.card-1.faq-1-question'),
								link: translator.t('section-5.card-1.faq-1-link'),
							},
							{
								question: translator.t('section-5.card-1.faq-2-question'),
								link: translator.t('section-5.card-1.faq-2-link'),
							},
						]}
					/>

					<SectionCard
						titles={{
							main: translator.t('section-5.card-2.title'),
							articles: translator.t('section-5.articles'),
							faqs: translator.t('section-5.faqs'),
						}}
						items={[
							translator.t('section-5.card-2.item-1'),
							translator.t('section-5.card-2.item-2'),
							translator.t('section-5.card-2.item-3'),
							translator.t('section-5.card-2.item-4'),
						]}
						paragraphs={[translator.t('section-5.card-2.paragraph-1'), translator.t('section-5.card-2.paragraph-2')]}
						articles={[
							{
								title: translator.t('section-5.card-2.article-1-title'),
								author: translator.t('section-5.card-2.article-1-author'),
								link: translator.t('section-5.card-2.article-1-link'),
							},
							{
								title: translator.t('section-5.card-2.article-2-title'),
								author: translator.t('section-5.card-2.article-2-author'),
								link: translator.t('section-5.card-2.article-2-link'),
							},
							{
								title: translator.t('section-5.card-2.article-3-title'),
								author: translator.t('section-5.card-2.article-3-author'),
								link: translator.t('section-5.card-2.article-3-link'),
							},
							{
								title: translator.t('section-5.card-2.article-4-title'),
								author: translator.t('section-5.card-2.article-4-author'),
								link: translator.t('section-5.card-2.article-4-link'),
							},
						]}
						faqs={[
							{
								question: translator.t('section-5.card-2.faq-1-question'),
								link: translator.t('section-5.card-2.faq-1-link'),
							},
							{
								question: translator.t('section-5.card-2.faq-2-question'),
								link: translator.t('section-5.card-2.faq-2-link'),
							},
							{
								question: translator.t('section-5.card-2.faq-3-question'),
								link: translator.t('section-5.card-2.faq-3-link'),
							},
						]}
					/>

					<SectionCard
						titles={{
							main: translator.t('section-5.card-3.title'),
							articles: translator.t('section-5.articles'),
							faqs: translator.t('section-5.faqs'),
						}}
						items={[
							translator.t('section-5.card-3.item-1'),
							translator.t('section-5.card-3.item-2'),
							translator.t('section-5.card-3.item-3'),
							translator.t('section-5.card-3.item-4'),
						]}
						paragraphs={[translator.t('section-5.card-3.paragraph-1'), translator.t('section-5.card-3.paragraph-2')]}
						articles={[
							{
								title: translator.t('section-5.card-3.article-1-title'),
								author: translator.t('section-5.card-3.article-1-author'),
								link: translator.t('section-5.card-3.article-1-link'),
							},
							{
								title: translator.t('section-5.card-3.article-2-title'),
								author: translator.t('section-5.card-3.article-2-author'),
								link: translator.t('section-5.card-3.article-2-link'),
							},
							{
								title: translator.t('section-5.card-3.article-3-title'),
								author: translator.t('section-5.card-3.article-3-author'),
								link: translator.t('section-5.card-3.article-3-link'),
							},
							{
								title: translator.t('section-5.card-3.article-4-title'),
								author: translator.t('section-5.card-3.article-4-author'),
								link: translator.t('section-5.card-3.article-4-link'),
							},
						]}
						faqs={[
							{
								question: translator.t('section-5.card-3.faq-1-question'),
								link: translator.t('section-5.card-3.faq-1-link'),
							},
						]}
					/>
				</div>
			</div>
		</BaseContainer>
	);
}

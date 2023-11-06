import { DefaultPageProps } from '@/app/[lang]/[country]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer } from '@socialincome/ui';
import { FAQSection } from './faq-section';

export default async function Page({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['website-faq'],
	});

	return (
		<BaseContainer className="mx-auto flex max-w-2xl flex-col space-y-16 py-8">
			<FAQSection
				title={translator.t('fighting-poverty.title')}
				questions={[
					{
						question: translator.t('fighting-poverty.question-1.question'),
						answer: translator.t('fighting-poverty.question-1.answer'),
						links: [
							{
								title: translator.t('fighting-poverty.question-1.link-1.title'),
								href: translator.t('fighting-poverty.question-1.link-1.href'),
							},
							{
								title: translator.t('fighting-poverty.question-1.link-2.title'),
								href: translator.t('fighting-poverty.question-1.link-2.href'),
							},
							{
								title: translator.t('fighting-poverty.question-1.link-3.title'),
								href: translator.t('fighting-poverty.question-1.link-3.href'),
							},
						],
					},
					{
						question: translator.t('fighting-poverty.question-2.question'),
						answer: translator.t('fighting-poverty.question-2.answer'),
						links: [
							{
								title: translator.t('fighting-poverty.question-2.link-1.title'),
								href: translator.t('fighting-poverty.question-2.link-1.href'),
							},
							{
								title: translator.t('fighting-poverty.question-2.link-2.title'),
								href: translator.t('fighting-poverty.question-2.link-2.href'),
							},
						],
					},
				]}
			/>
			<FAQSection
				title={translator.t('striving-equality.title')}
				questions={[
					{
						question: translator.t('striving-equality.question-1.question'),
						answer: translator.t('striving-equality.question-1.answer'),
					},
					{
						question: translator.t('striving-equality.question-2.question'),
						answer: translator.t('striving-equality.question-2.answer'),
					},
				]}
			/>
			<FAQSection
				title={translator.t('solidarity.title')}
				questions={[
					{
						question: translator.t('solidarity.question-1.question'),
						answer: translator.t('solidarity.question-1.answer'),
					},
					{
						question: translator.t('solidarity.question-2.question'),
						answer: translator.t('solidarity.question-2.answer'),
					},
				]}
			/>
			<FAQSection
				title={translator.t('ubi.title')}
				questions={[
					{
						question: translator.t('ubi.question-1.question'),
						answer: translator.t('ubi.question-1.answer'),
					},
					{
						question: translator.t('ubi.question-2.question'),
						answer: translator.t('ubi.question-2.answer'),
						links: [
							{
								title: translator.t('ubi.question-2.link-1.title'),
								href: translator.t('ubi.question-2.link-1.href'),
							},
						],
					},
				]}
			/>
			<FAQSection
				title={translator.t('contributors.title')}
				questions={[
					{
						question: translator.t('contributors.question-1.question'),
						answer: translator.t('contributors.question-1.answer'),
					},
					{
						question: translator.t('contributors.question-2.question'),
						answer: translator.t('contributors.question-2.answer'),
					},
					{
						question: translator.t('contributors.question-3.question'),
						answer: translator.t('contributors.question-3.answer'),
					},
				]}
			/>
			<FAQSection
				title={translator.t('recipients.title')}
				questions={[
					{
						question: translator.t('recipients.question-1.question'),
						answer: translator.t('recipients.question-1.answer'),
					},
					{
						question: translator.t('recipients.question-2.question'),
						answer: translator.t('recipients.question-2.answer'),
					},
					{
						question: translator.t('recipients.question-3.question'),
						answer: translator.t('recipients.question-3.answer'),
					},
					{
						question: translator.t('recipients.question-4.question'),
						answer: translator.t('recipients.question-4.answer'),
					},
				]}
			/>
			<FAQSection
				title={translator.t('the-arts.title')}
				questions={[
					{
						question: translator.t('the-arts.question-1.question'),
						answer: translator.t('the-arts.question-1.answer'),
					},
				]}
			/>
			<FAQSection
				title={translator.t('volunteering.title')}
				questions={[
					{
						question: translator.t('volunteering.question-1.question'),
						answer: translator.t('volunteering.question-1.answer'),
						links: [
							{
								title: translator.t('volunteering.question-1.link-1.title'),
								href: translator.t('volunteering.question-1.link-1.href'),
							},
						],
					},
				]}
			/>
		</BaseContainer>
	);
}

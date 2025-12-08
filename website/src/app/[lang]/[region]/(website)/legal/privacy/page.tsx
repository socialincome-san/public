import { DefaultPageProps } from '@/app/[lang]/[region]';
import { ProseAccordion } from '@/components/legacy/faq/prose-accordion';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { getMetadata } from '@/metadata';
import { BaseContainer, Typography } from '@socialincome/ui';

export async function generateMetadata(props: DefaultPageProps) {
	const params = await props.params;
	return getMetadata(params.lang as WebsiteLanguage, 'website-privacy');
}

export default async function Page(props: DefaultPageProps) {
	const params = await props.params;
	const translator = await Translator.getInstance({
		language: params.lang as WebsiteLanguage,
		namespaces: ['website-privacy'],
	});

	return (
		<BaseContainer className="mx-auto flex max-w-2xl flex-col space-y-12 py-8">
			<Typography size="5xl" weight="bold">
				{translator.t('title')}
			</Typography>
			<div className="prose">
				<Typography as="h3" size="3xl" weight="bold">
					{translator.t('responsibility.title')}
				</Typography>
				<div dangerouslySetInnerHTML={{ __html: translator.t('responsibility.content') }} />
			</div>
			<ProseAccordion
				title={translator.t('data.title')}
				items={[
					{ title: translator.t('data.section-1.title'), content: translator.t('data.section-1.content') },
					{ title: translator.t('data.section-2.title'), content: translator.t('data.section-2.content') },
					{ title: translator.t('data.section-3.title'), content: translator.t('data.section-3.content') },
					{ title: translator.t('data.section-4.title'), content: translator.t('data.section-4.content') },
				]}
			/>
			<ProseAccordion
				title={translator.t('tracking.title')}
				items={[
					{ title: translator.t('tracking.section-1.title'), content: translator.t('tracking.section-1.content') },
					{ title: translator.t('tracking.section-2.title'), content: translator.t('tracking.section-2.content') },
				]}
			/>
			<ProseAccordion
				title={translator.t('third-party.title')}
				items={[
					{
						title: translator.t('third-party.section-1.title'),
						content: translator.t('third-party.section-1.content'),
					},
					{
						title: translator.t('third-party.section-2.title'),
						content: translator.t('third-party.section-2.content'),
					},
					{
						title: translator.t('third-party.section-3.title'),
						content: translator.t('third-party.section-3.content'),
					},
					{
						title: translator.t('third-party.section-4.title'),
						content: translator.t('third-party.section-4.content'),
					},
				]}
			/>
			<ProseAccordion
				title={translator.t('rights.title')}
				items={[
					{
						title: translator.t('rights.section-1.title'),
						content: translator.t('rights.section-1.content'),
					},
				]}
			/>
		</BaseContainer>
	);
}

import { DefaultPageProps } from '@/app/[lang]/[country]';
import { ProseAccordion } from '@/components/prose-accordion';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';

export default async function Page({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['website-privacy'],
	});

	return (
		<BaseContainer className="mx-auto flex max-w-2xl flex-col space-y-12 py-16">
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

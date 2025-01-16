import { DefaultPageProps } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';

export async function generateMetadata({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['website-fundraisers'],
	});
	return { title: translator.t('metadata.title') };
}
export default async function Page({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['website-fundraisers'],
	});

	return (
		<BaseContainer className="mx-auto flex max-w-2xl flex-col space-y-12 py-8">
			<Typography size="5xl" weight="bold">
				{translator.t('title')}
			</Typography>
			<div className="prose">
				<Typography as="h3" size="3xl" weight="bold">
					{translator.t('guidelines.title')}
				</Typography>
				<Typography dangerouslySetInnerHTML={{ __html: translator.t('guidelines.section-1') }} />
				<Typography dangerouslySetInnerHTML={{ __html: translator.t('guidelines.section-2') }} />
				<Typography dangerouslySetInnerHTML={{ __html: translator.t('guidelines.section-3') }} />
				<Typography dangerouslySetInnerHTML={{ __html: translator.t('guidelines.section-4') }} />
				<Typography dangerouslySetInnerHTML={{ __html: translator.t('guidelines.section-5') }} />
			</div>
		</BaseContainer>
	);
}

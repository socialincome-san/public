import { DefaultPageProps } from '@/app/[lang]/[region]';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { BaseContainer, Typography } from '@socialincome/ui';

export const generateMetadata = async (props: DefaultPageProps) => {
	const params = await props.params;
	const translator = await Translator.getInstance({
		language: params.lang as WebsiteLanguage,
		namespaces: ['website-fundraisers'],
	});
	return { title: translator.t('metadata.title') };
};
export default async function Page(props: DefaultPageProps) {
	const params = await props.params;
	const translator = await Translator.getInstance({
		language: params.lang as WebsiteLanguage,
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

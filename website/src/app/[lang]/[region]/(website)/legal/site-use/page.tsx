import { DefaultPageProps } from '@/app/[lang]/[region]';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { getMetadata } from '@/lib/utils/metadata';
import { BaseContainer, Typography } from '@socialincome/ui';

export const generateMetadata = async ({ params }: DefaultPageProps) => {
	const { lang } = await params;
	return getMetadata(lang as WebsiteLanguage, 'website-terms-of-use');
};

export default async function Page({ params }: DefaultPageProps) {
	const { lang } = await params;
	const translator = await Translator.getInstance({
		language: lang as WebsiteLanguage,
		namespaces: ['website-terms-of-use'],
	});

	return (
		<BaseContainer className="mx-auto flex max-w-2xl flex-col space-y-12 py-8">
			<Typography size="5xl" weight="bold">
				{translator.t('title')}
			</Typography>
			<div className="prose">
				<Typography as="h3" size="3xl" weight="bold">
					{translator.t('general.title')}
				</Typography>
				<Typography dangerouslySetInnerHTML={{ __html: translator.t('general.section-1') }} />
				<Typography dangerouslySetInnerHTML={{ __html: translator.t('general.section-2') }} />
				<Typography dangerouslySetInnerHTML={{ __html: translator.t('general.section-3') }} />
			</div>
			<div className="prose">
				<Typography as="h3" size="3xl" weight="bold">
					{translator.t('links.title')}
				</Typography>
				<Typography dangerouslySetInnerHTML={{ __html: translator.t('links.section-1') }} />
			</div>
			<div className="prose">
				<Typography as="h3" size="3xl" weight="bold">
					{translator.t('data.title')}
				</Typography>
				<Typography dangerouslySetInnerHTML={{ __html: translator.t('data.section-1') }} />
				<Typography dangerouslySetInnerHTML={{ __html: translator.t('data.section-2') }} />
			</div>
			<div className="prose">
				<Typography as="h3" size="3xl" weight="bold">
					{translator.t('liability.title')}
				</Typography>
				<Typography dangerouslySetInnerHTML={{ __html: translator.t('liability.section-1') }} />
				<Typography dangerouslySetInnerHTML={{ __html: translator.t('liability.section-2') }} />
			</div>
			<div className="prose">
				<Typography as="h3" size="3xl" weight="bold">
					{translator.t('warranty.title')}
				</Typography>
				<Typography dangerouslySetInnerHTML={{ __html: translator.t('warranty.section-1') }} />
				<Typography dangerouslySetInnerHTML={{ __html: translator.t('warranty.section-2') }} />
			</div>
			<div className="prose">
				<Typography as="h3" size="3xl" weight="bold">
					{translator.t('disagreements.title')}
				</Typography>
				<Typography dangerouslySetInnerHTML={{ __html: translator.t('disagreements.section-1') }} />
				<Typography dangerouslySetInnerHTML={{ __html: translator.t('disagreements.section-2') }} />
			</div>
		</BaseContainer>
	);
}

import { DefaultPageProps } from '@/app/[lang]/[region]';
import { getMetadata } from '@/metadata';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';

export async function generateMetadata({ params }: DefaultPageProps) {
	const { lang } = await params;
	return getMetadata(lang, 'website-terms-of-use');
}

export default async function Page({ params }: DefaultPageProps) {
	const { lang } = await params;
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-terms-of-use'] });

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

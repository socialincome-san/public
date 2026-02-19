import { DefaultPageProps } from '@/app/[lang]/[region]';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { BaseContainer, Typography } from '@socialincome/ui';

export const generateMetadata = async ({ params }: DefaultPageProps) => {
	const { lang } = await params;
	const translator = await Translator.getInstance({
		language: lang as WebsiteLanguage,
		namespaces: ['website-terms-and-conditions'],
	});

	return { title: translator.t('metadata.title') };
};

export default async function Page({ params }: DefaultPageProps) {
	const { lang } = await params;
	const translator = await Translator.getInstance({
		language: lang as WebsiteLanguage,
		namespaces: ['website-terms-and-conditions'],
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
					{translator.t('participation.title')}
				</Typography>
				<Typography dangerouslySetInnerHTML={{ __html: translator.t('participation.section-1') }} />
				<Typography dangerouslySetInnerHTML={{ __html: translator.t('participation.section-2') }} />
				<Typography dangerouslySetInnerHTML={{ __html: translator.t('participation.section-3') }} />
				<Typography dangerouslySetInnerHTML={{ __html: translator.t('participation.section-4') }} />
				<Typography dangerouslySetInnerHTML={{ __html: translator.t('participation.section-5') }} />
				<Typography dangerouslySetInnerHTML={{ __html: translator.t('participation.section-6') }} />
			</div>
			<div className="prose">
				<Typography as="h3" size="3xl" weight="bold">
					{translator.t('data.title')}
				</Typography>
				<Typography dangerouslySetInnerHTML={{ __html: translator.t('data.section-1') }} />
				<Typography dangerouslySetInnerHTML={{ __html: translator.t('data.section-2') }} />
				<Typography dangerouslySetInnerHTML={{ __html: translator.t('data.section-3') }} />
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
				<Typography dangerouslySetInnerHTML={{ __html: translator.t('warranty.section-3') }} />
			</div>
			<div className="prose">
				<Typography as="h3" size="3xl" weight="bold">
					{translator.t('stopping.title')}
				</Typography>
				<Typography dangerouslySetInnerHTML={{ __html: translator.t('stopping.section-1') }} />
				<Typography dangerouslySetInnerHTML={{ __html: translator.t('stopping.section-2') }} />
			</div>
			<div className="prose">
				<Typography as="h3" size="3xl" weight="bold">
					{translator.t('deletion.title')}
				</Typography>
				<Typography dangerouslySetInnerHTML={{ __html: translator.t('deletion.section-1') }} />
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

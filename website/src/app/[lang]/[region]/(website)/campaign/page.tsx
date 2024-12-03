import { DefaultPageProps } from '@/app/[lang]/[region]';
import { CampaignForm } from '@/components/campaign/campaign-form';
import { getMetadata } from '@/metadata';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';

export async function generateMetadata({ params }: DefaultPageProps) {
	// TODO add more metadata to the translation files?
	return getMetadata(params.lang, 'website-campaign');
}

export default async function Page({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['website-campaign'],
	});

	return (
		<BaseContainer className="space-y-20">
			<Typography size="5xl" weight="bold">
				{translator.t('campaign-form.title')}
			</Typography>
			<CampaignForm lang={params.lang} region={params.region} />
		</BaseContainer>
	);
}

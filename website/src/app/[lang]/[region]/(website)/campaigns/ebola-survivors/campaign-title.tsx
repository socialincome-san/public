'use client';

import { WebsiteLanguage } from '@/i18n';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';

export async function CampaignTitle({ lang }: { lang: WebsiteLanguage }) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-campaign-ebola-survivors'],
	});

	return (
		<BaseContainer className="p-0">
			<div className="relative flex w-full flex-col space-y-12">
				<Typography as="h1" size="5xl" weight="bold" className="text-left">
					{translator.t('title')}
				</Typography>
				<Typography as="h2" size="4xl" weight="bold" lineHeight="snug" className="max-w-3xl text-left">
					{translator.t('subtitle')}
				</Typography>
			</div>
		</BaseContainer>
	);
}

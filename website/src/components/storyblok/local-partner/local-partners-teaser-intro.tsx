import { getTranslations } from 'next-intl/server';

export const LocalPartnersTeaserIntro = async () => {
	const t = await getTranslations('website-common');

	return (
		<div className="space-y-8">
			<p className="text-foreground mb-0 text-4xl break-words">{t('local-partners-page.teaser-title')}</p>
			<p className="text-foreground text-4xl font-bold break-words">{t('local-partners-page.teaser-subtitle')}</p>
			<p className="text-muted-foreground text-base leading-7">{t('local-partners-page.teaser-text')}</p>
		</div>
	);
};

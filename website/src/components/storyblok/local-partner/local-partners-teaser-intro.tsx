import { Translator } from '@/lib/i18n/translator';
import { getWebsiteRootParams } from '@/lib/i18n/website-root-params';

export const LocalPartnersTeaserIntro = async () => {
	const { lang } = await getWebsiteRootParams();
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });

	return (
		<div className="space-y-8">
			<p className="text-foreground mb-0 text-4xl break-words">{translator.t('local-partners-page.teaser-title')}</p>
			<p className="text-foreground text-4xl font-bold break-words">{translator.t('local-partners-page.teaser-subtitle')}</p>
			<p className="text-muted-foreground text-base leading-7">{translator.t('local-partners-page.teaser-text')}</p>
		</div>
	);
};

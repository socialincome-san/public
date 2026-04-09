import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import { PreviewPage } from './preview-page';

type Props = {
	title: string;
	lang: WebsiteLanguage;
	campaignsCount: number;
	recipientsCount: number;
};

export const PreviewProgram = async ({ title, lang, campaignsCount, recipientsCount }: Props) => {
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });

	return (
		<PreviewPage
			title={title}
			stats={
				<p className="text-xl">
					{campaignsCount}{' '}
					{campaignsCount === 1
						? translator.t('programs-page.campaign-singular')
						: translator.t('programs-page.campaign-plural')}
					{' · '}
					{recipientsCount}{' '}
					{recipientsCount === 1
						? translator.t('programs-page.recipient-singular')
						: translator.t('programs-page.recipient-plural')}
				</p>
			}
		>
			<div className="bg-card rounded-3xl border p-6">
				<h2 className="text-xl font-semibold">
					{translator.t('programs-page.about')} {title}
				</h2>
				<p className="text-muted-foreground mt-2">-</p>
			</div>
		</PreviewPage>
	);
};

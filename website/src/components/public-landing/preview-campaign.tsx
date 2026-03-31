import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import { PreviewPage } from './preview-page';

type Props = {
	title: string;
	description: string;
	lang: WebsiteLanguage;
	contributionsCount: number;
	daysLeft: number;
};

export const PreviewCampaign = async ({ title, description, lang, contributionsCount, daysLeft }: Props) => {
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });

	return (
		<PreviewPage
			title={title}
			stats={
				<p className="text-xl">
					{contributionsCount}{' '}
					{contributionsCount === 1
						? translator.t('campaigns-page.contribution-singular')
						: translator.t('campaigns-page.contribution-plural')}
					{' · '}
					{daysLeft}{' '}
					{daysLeft === 1 ? translator.t('campaigns-page.day-left-singular') : translator.t('campaigns-page.day-left-plural')}
				</p>
			}
		>
			<div className="rounded-3xl border bg-card p-6">
				<h2 className="text-xl font-semibold">
					{translator.t('campaigns-page.about')} {title}
				</h2>
				<p className="text-muted-foreground mt-2">{description || '-'}</p>
			</div>
		</PreviewPage>
	);
};

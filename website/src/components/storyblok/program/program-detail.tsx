import { HeroDonationsHeader } from '@/components/storyblok/shared/hero-donations-header';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage } from '@/lib/i18n/utils';

type Props = {
	title: string;
	description: string;
	lang: WebsiteLanguage;
	heroImageFilename?: string;
	heroImageAlt: string;
	campaignsCount?: number;
	recipientsCount?: number;
};

export const ProgramDetail = async ({
	title,
	description,
	lang,
	heroImageFilename,
	heroImageAlt,
	campaignsCount,
	recipientsCount,
}: Props) => {
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });

	return (
		<>
			<HeroDonationsHeader
				lang={lang}
				showDonationForm={false}
				title={title}
				heroImageFilename={heroImageFilename}
				heroImageAlt={heroImageAlt}
				stats={
					campaignsCount !== undefined && recipientsCount !== undefined
						? [
							{
								value: campaignsCount,
								label:
									campaignsCount === 1
										? translator.t('programs-page.campaign-singular')
										: translator.t('programs-page.campaign-plural'),
							},
							{
								value: recipientsCount,
								label:
									recipientsCount === 1
										? translator.t('programs-page.recipient-singular')
										: translator.t('programs-page.recipient-plural'),
							},
						]
						: []
				}
			/>
			<div className="max-w-content 2xl:w-site-width ml-[2vw] pl-8 2xl:mx-auto">
				<p className="text-base">{description || '-'}</p>
			</div>
		</>
	);
};

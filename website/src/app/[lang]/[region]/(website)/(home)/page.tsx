import { DefaultPageProps } from '@/app/[lang]/[region]';
import { Section1 } from '@/app/[lang]/[region]/(website)/(home)/section-1';
import { Section2 } from '@/app/[lang]/[region]/(website)/(home)/section-2';
import { Section3 } from '@/app/[lang]/[region]/(website)/(home)/section-3';
import { Section4 } from '@/app/[lang]/[region]/(website)/(home)/section-4';
import { Section5 } from '@/app/[lang]/[region]/(website)/(home)/section-5';
import { Section6 } from '@/app/[lang]/[region]/(website)/(home)/section-6';
import { Section7 } from '@/app/[lang]/[region]/(website)/(home)/section-7';
import { Translator } from '@socialincome/shared/src/utils/i18n';

export default async function Page({ params: { lang, region } }: DefaultPageProps) {
	const translator = await Translator.getInstance({ language: lang, namespaces: 'website-home' });
	const vimeoVideoId = Number(translator.t('section-2.vimeo-video-id'));
	return (
		<>
			<Section1 lang={lang} region={region} />
			<Section2
				vimeoVideoId={vimeoVideoId}
				translations={{
					title1: translator.t('section-2.title-1'),
					title2: translator.t('section-2.title-2'),
					subtitle1: translator.t('section-2.subtitle-1'),
					videoButton: translator.t('section-2.video-button'),
				}}
			/>
			{region === 'ch' && <Section3 lang={lang} region={region} />}
			<Section4 lang={lang} />
			<Section5 lang={lang} />
			<Section6 lang={lang} />
			<Section7 lang={lang} />
		</>
	);
}

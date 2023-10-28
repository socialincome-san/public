import { DefaultPageProps } from '@/app/[lang]/[country]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import Section1 from './section-1';
import Section2 from './section-2';
import Section3 from './section-3';
import Section4 from './section-4';
import Section5 from './section-5';
import Section6 from './section-6';
import Section7 from './section-7';

export default async function Page(props: DefaultPageProps) {
	const translator = await Translator.getInstance({ language: props.params.lang, namespaces: 'website-home' });
	const vimeoVideoId = Number(translator.t('section-2.vimeo-video-id'));
	return (
		<>
			<Section1 {...props} />
			<Section2
				vimeoVideoId={vimeoVideoId}
				translations={{
					title1: translator.t('section-2.title-1'),
					title2: translator.t('section-2.title-2'),
					subtitle1: translator.t('section-2.subtitle-1'),
					videoButton: translator.t('section-2.video-button'),
				}}
			/>
			{props.params.country === 'ch' && <Section3 {...props} />}
			<Section4 {...props} />
			<Section5 {...props} />
			<Section6 {...props} />
			<Section7 {...props} />
		</>
	);
}

import { DefaultPageProps } from '@/app/[lang]/[region]';
import { AddressInequality } from '@/app/[lang]/[region]/(website)/(home)/(sections)/address-inequality';
import { Hero } from '@/app/[lang]/[region]/(website)/(home)/(sections)/hero';
import { Recognized } from '@/app/[lang]/[region]/(website)/(home)/(sections)/recognized';
import { Sdg } from '@/app/[lang]/[region]/(website)/(home)/(sections)/sdg';
import { SwissSection } from '@/app/[lang]/[region]/(website)/(home)/(sections)/swiss-section';
import { ThreeApproaches } from '@/app/[lang]/[region]/(website)/(home)/(sections)/three-approaches';
import { WhatWouldChange } from '@/app/[lang]/[region]/(website)/(home)/(sections)/what-would-change';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Video } from './(sections)/video';

export default async function Page({ params: { lang, region } }: DefaultPageProps) {
	const translator = await Translator.getInstance({ language: lang,
		namespaces: ['website-home', 'website-videos'],
	});
	const vimeoVideoId = Number(translator.t('id.video-02'));
	return (
		<>
			<Hero lang={lang} region={region} />
			<Video lang={lang} />
			<WhatWouldChange
				vimeoVideoId={vimeoVideoId}
				translations={{
					title1: translator.t('section-2.title-1'),
					title2: translator.t('section-2.title-2'),
					subtitle1: translator.t('section-2.subtitle-1'),
					videoButton: translator.t('section-2.video-button'),
				}}
			/>
			{region === 'ch' && <SwissSection lang={lang} region={region} />}
			<AddressInequality lang={lang} />
			<ThreeApproaches lang={lang} />
			<Sdg lang={lang} />
			<Recognized lang={lang} />
		</>
	);
}

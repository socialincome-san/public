import { WebsiteLanguage } from '@/i18n';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import { FontColor } from '@socialincome/ui/src/interfaces/color';
import Image from 'next/image';
import changeGif from '../(assets)/change.gif';

export default async function LandingPage({ lang }: { lang: WebsiteLanguage }) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-about-us'],
	});

	return (
		<BaseContainer className="min-h-screen-navbar grid grid-cols-1 content-center items-center gap-16 md:grid-cols-5">
			<p className="mx-auto max-w-lg md:col-span-3">
				{translator.t<{ text: string; color?: FontColor }[]>('landing-page.title').map((title, index) => (
					<Typography as="span" key={index} size="5xl" weight="bold" color={title.color}>
						{title.text}
					</Typography>
				))}
			</p>
			<Image
				className="mx-auto w-full max-w-lg md:order-first md:col-span-2"
				src={changeGif}
				alt="Change animation"
				style={{ objectFit: 'cover' }}
			/>
		</BaseContainer>
	);
}

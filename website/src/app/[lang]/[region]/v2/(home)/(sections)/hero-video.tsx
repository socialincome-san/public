import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Button, Typography } from '@socialincome/ui';
import { FontColor } from '@socialincome/ui/src/interfaces/color';
import Script from 'next/script';

export async function HeroVideo({ lang, region }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-home2', 'common'],
	});

	return (
<<<<<<< HEAD
		<BaseContainer className="mb-80 mt-72 flex h-fit w-fit flex-col items-center justify-center">
			<div>
				<div className="relative z-10 m-auto flex w-3/5 flex-col text-center text-white ">
					<div>
						{translator.t<{ text: string; color?: FontColor }[]>('section-1.title-1').map((title, index) => (
							<Typography as="span" size="5xl" weight="medium" key={index} color={title.color}>
								{title.text}{' '}
							</Typography>
						))}
					</div>
					<Button className="relative z-10 mt-32 w-1/5 self-center text-center">Handle Jezt</Button>
				</div>
				<div className="self-center">
					<iframe
						src="https://player.vimeo.com/video/938363500?h=514d15126c&color=ffffff&title=0&byline=0&portrait=0"
						className="absolute bottom-[calc(1vw-10.5%)] left-0 h-full w-full"
						frameBorder={0}
						allow="autoplay; fullscreen; picture-in-picture"
						allowFullScreen={true}
					/>
				</div>
				<Script src="https://player.vimeo.com/api/player.js"></Script>
=======
		<BaseContainer>
			<div className="h-[calc(100vh-theme(spacing.20))]">
				{translator.t<{ text: string; color?: FontColor }[]>('section-1.title-1').map((title, index) => (
					<Typography as="span" key={index} color={title.color}>
						{title.text}{' '}
					</Typography>
				))}
>>>>>>> 589d624f16008bf4ee68128fadcfc44528aa5c62
			</div>
		</BaseContainer>
	);
}

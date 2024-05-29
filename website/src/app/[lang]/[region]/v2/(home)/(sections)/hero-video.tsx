import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Button, Typography } from '@socialincome/ui';
import { FontColor } from '@socialincome/ui/src/interfaces/color';
import MuxVideoComponent from '../(components)/mux-video';

export async function HeroVideo({ lang, region }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-home2', 'common'],
	});

	return (
		<BaseContainer className="mb-80 mt-72 flex h-fit w-fit flex-col items-center justify-center">
			<MuxVideoComponent />
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
			</div>
		</BaseContainer>
	);
}

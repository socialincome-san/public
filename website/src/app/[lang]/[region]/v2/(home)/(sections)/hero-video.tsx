import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Button, Typography } from '@socialincome/ui';
import { FontColor } from '@socialincome/ui/src/interfaces/color';
import MuxVideoComponent from '../(components)/mux-video';

export async function HeroVideo({ lang }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-home2', 'common'],
	});

	return (
		<div className="relative h-screen w-full">
			<MuxVideoComponent />
			<div className="absolute left-2 right-2 top-[10%] mx-auto max-w-4xl md:top-[30%]">
				<div className="flex flex-col items-center">
					<div className="text-center text-white">
						{translator.t<{ text: string; color?: FontColor }[]>('section-1.title-1').map((title, index) => (
							<Typography as="span" size="6xl" weight="medium" key={index} lineHeight="normal" color={title.color}>
								{title.text}{' '}
							</Typography>
						))}
					</div>
				</div>
			</div>
			<Button className="absolute inset-x-0 bottom-16 mx-auto w-48">Handle Jetzt</Button>
		</div>
	);
}

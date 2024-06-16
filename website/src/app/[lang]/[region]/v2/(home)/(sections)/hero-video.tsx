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
			<div className="absolute inset-2">
				<div className=" flex h-full flex-col justify-around">
					<div className="hidden md:block" />
					<div className="mx-auto max-w-4xl text-center text-white">
						{translator.t<{ text: string; color?: FontColor }[]>('section-1.title-1').map((title, index) => (
							<Typography as="span" size="6xl" weight="medium" key={index} lineHeight="tight" color={title.color}>
								{title.text}{' '}
							</Typography>
						))}
					</div>
					<Button className="mx-auto hidden md:block">Handle Jetzt</Button>
				</div>
			</div>
		</div>
	);
}

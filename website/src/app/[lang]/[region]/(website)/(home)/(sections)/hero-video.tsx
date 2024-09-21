import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Button, Typography } from '@socialincome/ui';
import { FontColor } from '@socialincome/ui/src/interfaces/color';
import Link from 'next/link';
import MuxVideoComponent from '../(components)/mux-video';

export async function HeroVideo({ lang, region }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-home2', 'common'],
	});

	return (
		<div className="relative h-[calc(100svh)] w-full">
			<MuxVideoComponent />
			<div className="absolute inset-2">
				<div className=" flex h-full flex-col justify-around">
					<div className="hidden md:block" />
					<div className="mx-auto max-w-4xl text-center text-white">
						{translator.t<{ text: string; color?: FontColor }[]>('section-1.title-1').map((title, index) => (
							<Typography
								key={index}
								as="span"
								weight="medium"
								color={title.color}
								className="text-3xl sm:text-4xl md:text-6xl"
							>
								{title.text}{' '}
							</Typography>
						))}
					</div>
					<Link href={`/${lang}/${region}/donate/individual`}>
						<Button className="mx-auto hidden md:block"><Typography>{translator.t('section-1.take-action')}</Typography></Button>
					</Link>
				</div>
			</div>
		</div>
	);
}

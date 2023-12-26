import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Button, Typography } from '@socialincome/ui';
import { FontColor } from '@socialincome/ui/src/interfaces/color';
import Image from 'next/image';
import Link from 'next/link';
import helpingOthers from '../(assets)/helping-others.gif';
import jackpotGif from '../(assets)/jackpot.gif';
import togetherGif from '../(assets)/together.gif';

export async function SwissSection({ lang, region }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-home', 'common'],
	});

	return (
		<BaseContainer backgroundColor="bg-muted" className="flex min-h-screen flex-col py-16 md:py-32">
			<p>
				{translator.t<{ text: string; color?: FontColor }[]>('section-3.title').map((title, index) => (
					<Typography as="span" key={index} size="4xl" weight="bold" color={title.color}>
						{title.text}
					</Typography>
				))}
			</p>
			<div className="my-16 grid grid-cols-1 content-center items-center gap-x-24 gap-y-8 md:my-64 lg:grid-cols-2">
				<Image className="mx-auto w-full max-w-lg" src={jackpotGif} alt="Jackpot" />
				<div className="space-y-8">
					<Typography size="3xl" weight="bold">
						{translator.t('section-3.jackpot-title')}
					</Typography>
					<Typography size="lg">{translator.t('section-3.jackpot-text')}</Typography>
					<div>
						<Link href={`/${lang}/${region}/donate/individual`}>
							<Button size="lg">{translator.t('section-3.jackpot-button')}</Button>
						</Link>
					</div>
				</div>
			</div>
			<div className="my-24 grid grid-cols-1 content-center items-center gap-x-24 gap-y-8 md:my-64 lg:grid-cols-2">
				<Image className="mx-auto w-full max-w-lg" src={helpingOthers} alt="Helping Others" />
				<div className="space-y-8">
					<Typography size="3xl" weight="bold">
						{translator.t('section-3.helping-others-title')}
					</Typography>
					<Typography size="lg">{translator.t('section-3.helping-others-text')}</Typography>
					<div>
						<Link href={`/${lang}/${region}/donate/individual`}>
							<Button size="lg">{translator.t('section-3.helping-others-button')}</Button>
						</Link>
					</div>
				</div>
			</div>
			<div className="my-24 grid grid-cols-1 content-center items-center gap-x-24 gap-y-8 md:my-64 lg:grid-cols-2">
				<Image className="mx-auto w-full max-w-lg" src={togetherGif} alt="Together" />
				<div className="space-y-8">
					<Typography size="3xl" weight="bold">
						{translator.t('section-3.together-title')}
					</Typography>
					<Typography size="lg">{translator.t('section-3.together-text')}</Typography>
					<div>
						<Link href={`/${lang}/${region}/donate/individual`}>
							<Button size="lg">{translator.t('section-3.together-button')}</Button>
						</Link>
					</div>
				</div>
			</div>
		</BaseContainer>
	);
}

import { DefaultParams } from '@/app/[lang]/[region]';
import sdgLogo from '@/app/[lang]/[region]/(website)/(home)/(assets)/sdg-logo.svg';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { Typography } from '@socialincome/ui';
import { FontColor } from '@socialincome/ui/src/interfaces/color';
import Image from 'next/image';
import Town from '../(assets)/sdg-town.jpg';

export async function SDGGoals({ lang }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang as WebsiteLanguage,
		namespaces: ['website-home'],
	});

	return (
		<div
			className="flex flex-col bg-cover bg-center pb-64 pt-20 md:pb-80"
			style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.0)), url(${Town.src})` }}
		>
			<Typography
				color="primary-foreground"
				className="mx-auto mt-8 w-3/4 text-center md:mt-16"
				size="4xl"
				weight="medium"
			>
				{translator.t<{ text: string; color?: FontColor }[]>('section-10.title-1').map((title, index) => (
					<Typography as="span" key={index} color={title.color}>
						{title.text}{' '}
					</Typography>
				))}
			</Typography>
			<Image className="mx-auto mt-8 w-96 max-w-[75%]" src={sdgLogo} alt="Sustainable Development Goals Logo" />
			<div className="mx-auto -mb-6 flex w-4/5 max-w-xl pt-20 text-center text-xl text-white md:pt-40 md:text-2xl">
				<div className="bg-primary flex h-72 flex-1 -rotate-6 flex-col items-center justify-between py-4 md:h-96">
					<div />
					<Typography weight="medium" className="w-3/4">
						{translator.t('section-10.sdg-1-title')}
					</Typography>
					<Typography size="sm">{translator.t('section-10.sdg-1')}</Typography>
				</div>
				<div className="bg-accent -ml-6 mt-12 flex h-72 flex-1 rotate-2 flex-col items-center justify-between py-4 md:h-96">
					<div />
					<Typography weight="medium" className="w-3/4">
						{translator.t('section-10.sdg-10-title')}
					</Typography>
					<Typography size="sm">{translator.t('section-10.sdg-10')}</Typography>
				</div>
			</div>
		</div>
	);
}

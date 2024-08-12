import { DefaultParams } from '@/app/[lang]/[region]';
import sdgLogo from '@/app/[lang]/[region]/(website)/(home)/(assets)/sdg-logo.svg';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import { FontColor } from '@socialincome/ui/src/interfaces/color';
import Image from 'next/image';
import Town from '../(assets)/sdg-town.jpg';

export async function Sdgoals({ lang, region }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-home2'],
	});

	return (
		<div className="relative">
			<BaseContainer className="relative pb-14">
				<div className="flex flex-col items-center justify-center pb-10 pt-20">
					<div className="z-10 text-white">
						{translator.t<{ text: string; color?: FontColor }[]>('section-10.title-1').map((title, index) => (
							<Typography as="span" key={index} size="3xl" color={title.color}>
								{title.text}{' '}
							</Typography>
						))}
					</div>
					<Image className="z-10 my-4 h-9 w-auto max-w-xs" src={sdgLogo} alt="Sustainable Development Goals Logo" />
				</div>
				<div className="my-12 flex flex-row items-center justify-center text-center text-white">
					<div className="z-10 flex h-[33rem] w-1/3 -rotate-6 flex-col self-center pt-24">
						<Typography size="3xl" className="mb-40 w-2/3 self-center pt-32">
							{translator.t('section-10.sdg-1-title')}
						</Typography>
						<Typography>{translator.t('section-10.sdg-1')}</Typography>
					</div>
					<div className="bg-accent relative right-12 top-10 z-10 flex h-[33rem] w-1/3 rotate-3 flex-col self-center pt-24">
						<Typography size="3xl" className="mb-40 w-4/5 self-center pt-32">
							{translator.t('section-10.sdg-10-title')}
						</Typography>
						<Typography>{translator.t('section-10.sdg-10')}</Typography>
					</div>
				</div>
			</BaseContainer>
			<Image src={Town} alt="Town image" className="absolute top-0 h-auto w-full" />
		</div>
	);
}

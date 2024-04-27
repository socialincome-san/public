import { DefaultParams } from '@/app/[lang]/[region]';
import sdgLogo from '@/app/[lang]/[region]/(website)/(home)/(assets)/sdg-logo.svg';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import { FontColor } from '@socialincome/ui/src/interfaces/color';
import Image from 'next/image';

export async function Sdgoals({ lang, region }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-home2'],
	});

	return (
		<BaseContainer backgroundColor="bg-accent-foreground" className="pb-14">
			<div className="flex flex-col items-center justify-center pt-16">
				<div className="text-white">
					{translator.t<{ text: string; color?: FontColor }[]>('section-10.title-1').map((title, index) => (
						<Typography as="span" key={index} size="xl" color={title.color}>
							{title.text}{' '}
						</Typography>
					))}
				</div>
				<Image className="h-7 w-auto max-w-xs" src={sdgLogo} alt="Sustainable Development Goals Logo" />
			</div>
			<div className="my-12 flex flex-row items-center justify-center text-center text-white">
				<div className="bg-primary flex h-72 w-1/5 -rotate-6 flex-col self-center pt-24">
					<Typography weight="medium" className="mb-24 w-1/2 self-center">
						{translator.t('section-10.sdg-1-title')}
					</Typography>
					<Typography size="xs">{translator.t('section-10.sdg-1')}</Typography>
				</div>
				<div className="bg-accent relative right-6 top-6 flex h-72 w-1/5 rotate-3 flex-col self-center pt-24">
					<Typography weight="medium" className="mb-24 w-3/5 self-center">
						{translator.t('section-10.sdg-10-title')}
					</Typography>
					<Typography size="xs">{translator.t('section-10.sdg-10')}</Typography>
				</div>
			</div>
		</BaseContainer>
	);
}

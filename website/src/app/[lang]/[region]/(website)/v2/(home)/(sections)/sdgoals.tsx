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
		<BaseContainer>
			<div>
				{translator.t<{ text: string; color?: FontColor }[]>('section-10.title-1').map((title, index) => (
					<Typography as="span" key={index} color={title.color}>
						{title.text}{' '}
					</Typography>
				))}
			</div>
			<Image className="w-auto max-w-xs" src={sdgLogo} alt="Sustainable Development Goals Logo" />
			<Typography>{translator.t('section-10.sdg-1-title')}</Typography>
			<Typography>{translator.t('section-10.sdg-1')}</Typography>
			<Typography>{translator.t('section-10.sdg-10-title')}</Typography>
			<Typography>{translator.t('section-10.sdg-10')}</Typography>
		</BaseContainer>
	);
}

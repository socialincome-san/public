import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import { FontColor } from '@socialincome/ui/src/interfaces/color';

export async function Introduction({ lang, region }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-home2'],
	});

	return (
		<BaseContainer>
			<Typography>{translator.t('section-2.title-1')}</Typography>
			<div>
				{translator.t<{ text: string; color?: FontColor }[]>('section-2.title-2').map((title, index) => (
					<Typography as="span" key={index} color={title.color}>
						{title.text}{' '}
					</Typography>
				))}
			</div>
			<Typography>{translator.t('section-2.subtitle-1')}</Typography>
			<Typography>{translator.t('section-2.text-1.1')}</Typography>
			<Typography>{translator.t('section-2.text-1.2')}</Typography>
			<Typography>{translator.t('section-2.subtitle-2')}</Typography>
			<Typography>{translator.t('section-2.text-2')}</Typography>
			<Typography>{translator.t('section-2.subtitle-3')}</Typography>
			<Typography>{translator.t('section-2.text-3')}</Typography>
		</BaseContainer>
	);
}

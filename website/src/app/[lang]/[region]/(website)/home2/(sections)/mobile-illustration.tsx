import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import { FontColor } from '@socialincome/ui/src/interfaces/color';

export async function MobileIllustration({ lang, region }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-home2'],
	});

	return (
		<BaseContainer>
			<div>
				{translator.t<{ text: string; color?: FontColor }[]>('section-5.title-1').map((title, index) => (
					<Typography as="span" key={index} color={title.color}>
						{title.text}{' '}
					</Typography>
				))}
			</div>
			<Typography>{translator.t('section-5.subtitle-1')}</Typography>
		</BaseContainer>
	);
}

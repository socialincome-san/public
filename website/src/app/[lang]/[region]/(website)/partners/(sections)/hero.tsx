import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import { FontColor } from '@socialincome/ui/src/interfaces/color';

export async function Hero({ lang }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-partners'],
	});

	return (
		<BaseContainer className="mx-auto mt-20 mb-8 flex w-4/5 flex-col items-center justify-center md:mb-20 lg:w-3/5">
			<div className="mb-8 text-center">
				{translator.t<{ text: string; color?: FontColor }[]>('hero.title-1').map((title, index) => (
					<Typography as="span" size="3xl" weight="medium" color={title.color} key={index}>
						{title.text}{' '}
					</Typography>
				))}
			</div>
		</BaseContainer>
	);
}

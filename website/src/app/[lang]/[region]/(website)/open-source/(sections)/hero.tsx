import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { Typography } from '@socialincome/ui';
import { FontColor } from '@socialincome/ui/src/interfaces/color';

export const Hero = async ({ lang }: DefaultParams) => {
	const translator = await Translator.getInstance({
		language: lang as WebsiteLanguage,
		namespaces: ['website-open-source'],
	});

	return (
		<div className="mx-auto mb-8 mt-20 flex w-4/5 flex-col items-center justify-center md:mb-10 lg:w-3/5">
			<div className="mb-8 text-center">
				{translator.t<{ text: string; color?: FontColor }[]>('hero.title-1').map((title, index) => (
					<Typography as="span" size="5xl" weight="medium" color={title.color} key={index}>
						{title.text}{' '}
					</Typography>
				))}
			</div>
			<Typography size="2xl" className="mb-8 text-center">
				{translator.t('hero.subtitle')}
			</Typography>
		</div>
	);
};

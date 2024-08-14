import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Typography } from '@socialincome/ui';
import { FontColor } from '@socialincome/ui/src/interfaces/color';
import Image from 'next/image';
import MobilesImg from '../(assets)/mobilesImgData.png';

export async function MobileIllustration({ lang, region }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-home2'],
	});

	return (
		<div className="theme-blue-v2 flex flex-col items-center px-8 py-32 text-center">
			<Typography size="3xl">
				{translator.t<{ text: string; color?: FontColor }[]>('section-5.title-1').map((title, index) => (
					<Typography as="span" key={index} color={title.color}>
						{title.text}
						<br />
					</Typography>
				))}
			</Typography>
			<Typography className="mt-8 max-w-md md:mt-12 md:w-1/2">{translator.t('section-5.subtitle-1')}</Typography>
			<div className="md:-mt-10 md:w-3/4">
				<Image className="mx-auto w-full max-w-5xl" src={MobilesImg} alt="Mobiles photo" />
			</div>
		</div>
	);
}

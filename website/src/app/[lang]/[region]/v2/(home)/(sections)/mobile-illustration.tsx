import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import { FontColor } from '@socialincome/ui/src/interfaces/color';
import Image from 'next/image';
import MobilesImg from '../(assets)/mobilesImgData.png';

export async function MobileIllustration({ lang, region }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-home2'],
	});

	return (
		<BaseContainer backgroundColor="bg-foreground-dark" className="relative pb-96 pt-10">
			<div className="flex flex-col items-center justify-center pt-12 text-center text-white">
				<div className="z-10 mb-4">
					{translator.t<{ text: string; color?: FontColor }[]>('section-5.title-1').map((title, index) => (
						<Typography as="span" size="3xl" key={index} color={title.color}>
							{title.text}
							<br />
						</Typography>
					))}
				</div>
				<Typography className="z-10 w-96 pb-48 pt-6">{translator.t('section-5.subtitle-1')}</Typography>
				<Image src={MobilesImg} alt="Mobiles photo" className="absolute top-44" />
			</div>
		</BaseContainer>
	);
}

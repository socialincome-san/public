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
<<<<<<< HEAD
		<BaseContainer backgroundColor="bg-foreground-dark" className="relative pb-96 pt-10">
			<div className="flex flex-col items-center justify-center pt-12 text-center text-white">
				<div className="z-10 mb-4">
					{translator.t<{ text: string; color?: FontColor }[]>('section-5.title-1').map((title, index) => (
						<Typography as="span" size="3xl" key={index} color={title.color}>
=======
		<BaseContainer backgroundColor="bg-primary">
			<div className="flex flex-col items-center justify-center pt-12 text-center text-white">
				<div>
					{translator.t<{ text: string; color?: FontColor }[]>('section-5.title-1').map((title, index) => (
						<Typography as="span" size="xl" key={index} color={title.color}>
>>>>>>> 589d624f16008bf4ee68128fadcfc44528aa5c62
							{title.text}
							<br />
						</Typography>
					))}
				</div>
<<<<<<< HEAD
				<Typography className="z-10 w-96 pb-48 pt-6">{translator.t('section-5.subtitle-1')}</Typography>
				<Image src={MobilesImg} alt="Mobiles photo" className="absolute top-44" />
=======
				<Typography size="sm" className="w-80 pt-6">
					{translator.t('section-5.subtitle-1')}
				</Typography>
				<Image src={MobilesImg} alt="Mobiles photo" className="px-20" />
>>>>>>> 589d624f16008bf4ee68128fadcfc44528aa5c62
			</div>
		</BaseContainer>
	);
}

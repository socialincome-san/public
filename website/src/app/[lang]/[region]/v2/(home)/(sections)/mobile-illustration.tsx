import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import { FontColor } from '@socialincome/ui/src/interfaces/color';
import MobilesImg from '../(assets)/mobilesImgData.png'
import Image from 'next/image';

export async function MobileIllustration({ lang, region }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-home2'],
	});

	return (
		<BaseContainer className="bg-primary" >
			<div className='flex flex-col justify-center items-center text-center text-white pt-12'>
				<div>
					{translator.t<{ text: string; color?: FontColor }[]>('section-5.title-1').map((title, index) => (
						<Typography as="span" size='xl' key={index} color={title.color}>
							{title.text}<br/>
						</Typography>
					))}
				</div>
				<Typography size='sm' className='w-80 pt-6'>{translator.t('section-5.subtitle-1')}</Typography>
				<Image src={MobilesImg} alt="Mobiles photo" className='px-20' />
			</div>
		</BaseContainer>
	);
}

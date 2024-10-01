import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import { FontColor } from '@socialincome/ui/src/interfaces/color';
import Image from 'next/image';
import YellowBlueDots from '../(assets)/yellowBlueDotsImgData.png';

export async function RecipientSelection({ lang }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-home'],
	});

	return (
		<BaseContainer className="pt-16 text-white">
			<div className="align-center flex flex-col justify-center text-center">
				<div className="mb-16 mt-10 w-1/2 self-center">
					{translator.t<{ text: string; color?: FontColor }[]>('section-9.title-1').map((title, index) => (
						<Typography as="span" weight="medium" size="3xl" key={index} color={title.color}>
							{title.text}{' '}
						</Typography>
					))}
				</div>
				<Image src={YellowBlueDots} alt="Yellow and Blue dots" className="mb-32 h-auto w-full px-80" />
				<ol className="m-8 flex list-decimal flex-row gap-x-10 text-justify">
					<li className="mx-4">
						<Typography size="sm">{translator.t('section-9.text-1.1')}</Typography>
					</li>
					<li className="mx-4">
						<Typography size="sm">{translator.t('section-9.text-1.2')}</Typography>
					</li>
				</ol>
			</div>
		</BaseContainer>
	);
}

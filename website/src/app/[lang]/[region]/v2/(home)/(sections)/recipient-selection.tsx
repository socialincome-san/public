import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import { FontColor } from '@socialincome/ui/src/interfaces/color';
import Image from 'next/image';
import YellowBlueDots from '../(assets)/yellowBlueDotsImgData.png';

export async function RecipientSelection({ lang, region }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-home2'],
	});

	return (
		<BaseContainer className="theme-blue-v2 pt-16 text-white">
			<div className="align-center flex flex-col justify-center text-center">
				<div className="mb-12 w-2/5 self-center">
					{translator.t<{ text: string; color?: FontColor }[]>('section-9.title-1').map((title, index) => (
						<Typography as="span" weight="medium" size="xl" key={index} color={title.color}>
							{title.text}{' '}
						</Typography>
					))}
				</div>
				<Image src={YellowBlueDots} alt="Yellow and Blue dots" className="mb-16 px-80" />
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

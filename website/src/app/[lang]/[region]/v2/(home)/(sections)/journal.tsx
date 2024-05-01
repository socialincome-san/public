import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import Image, { StaticImageData } from 'next/image';
import { ReactElement } from 'react';
import avatarImgData from '../(assets)/aurelie.png';
import townImgData from '../(assets)/sdg-town.jpg';

type JournalCardDetails = {
	title: string;
	author: string;
	authorImgData: StaticImageData;
	description: string;
	sideImgData?: StaticImageData;
};

const JournalCard = ({ title, author, authorImgData, description, sideImgData }: JournalCardDetails): ReactElement => {
	return (
		<div className="mx-3">
			<div className="ml-3 flex flex-col items-start justify-start">
				<div className="mb-5 flex flex-row">
					<div className="mt-3">
						<Typography color="accent" size="2xl">
							{title}
						</Typography>
						<div className="mt-3 flex flex-row items-center justify-start">
							<Image className="mr-3 h-12 w-12 rounded-full bg-gray-50" src={avatarImgData} alt={`${author} Image`} />
							<Typography size="sm">{author}</Typography>
						</div>
					</div>
					{sideImgData ? <Image src={townImgData} className="ml-40 mt-3 h-24 w-auto" alt="Town image" /> : ''}
				</div>
				<Typography size="sm" className="mb-5">
					{description}
				</Typography>
			</div>
		</div>
	);
};

export async function Journal({ lang, region }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-home2', 'common'],
	});

	return (
		<BaseContainer>
			<div>Journal section</div>
		</BaseContainer>
	);
}

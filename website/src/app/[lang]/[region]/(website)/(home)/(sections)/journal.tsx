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

const JournalCard = ({ title, author, description, sideImgData }: JournalCardDetails): ReactElement => {
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

export async function Journal({ lang }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-home', 'common'],
	});

	return (
		<BaseContainer className="mt-64 flex flex-col items-center justify-center space-y-12">
			<Typography size="3xl" weight="medium">
				{translator.t('section-11.title')}
			</Typography>
			<div className="flex flex-row">
				<div className="mx-3 flex w-1/2 flex-col">
					<hr />
					<JournalCard
						title={translator.t('section-11.card-1-title')}
						author={translator.t('section-11.card-1-author')}
						authorImgData={avatarImgData}
						description={translator.t('section-11.card-1-description')}
						sideImgData={townImgData}
					/>
					<hr />
					<JournalCard
						title={translator.t('section-11.card-2-title')}
						author={translator.t('section-11.card-2-author')}
						authorImgData={avatarImgData}
						description={translator.t('section-11.card-2-description')}
					/>
					<hr />
				</div>
				<div className="mx-3 flex w-1/2 flex-col">
					<hr />
					<JournalCard
						title={translator.t('section-11.card-3-title')}
						author={translator.t('section-11.card-3-author')}
						authorImgData={avatarImgData}
						description={translator.t('section-11.card-3-description')}
					/>
					<hr />
					<JournalCard
						title={translator.t('section-11.card-4-title')}
						author={translator.t('section-11.card-4-author')}
						authorImgData={avatarImgData}
						description={translator.t('section-11.card-4-description')}
					/>
					<hr />
				</div>
			</div>
			<Typography color="accent">{translator.t('section-11.all-articles')}</Typography>
		</BaseContainer>
	);
}

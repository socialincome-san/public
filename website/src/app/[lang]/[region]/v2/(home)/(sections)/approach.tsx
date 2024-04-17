import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import { ApproachCard } from '../(components)/approach-cards';

type ApproachCardProps = {
	category: string;
	title: string;
	points: {
		text: string;
	}[];
};

export async function Approach({ lang, region }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-home2'],
	});
	const cards = translator.t<ApproachCardProps[]>('section-7.cards');

	return (
		<BaseContainer className="mb-32 mt-10 flex flex-col items-center justify-center">
			<Typography size="2xl" weight="medium" color="foreground-dark" className="my-10 w-1/3 text-center">
				{translator.t('section-7.title-1')}
			</Typography>
			<div className="flex">
				{cards.map((card, key) => {
					return <ApproachCard key={key} category={card.category} title={card.title} points={card.points} />;
				})}
			</div>
		</BaseContainer>
	);
}

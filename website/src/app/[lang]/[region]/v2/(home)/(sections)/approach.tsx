import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Card, CardContent, CardHeader, Typography } from '@socialincome/ui';

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
		<div className="flex flex-col items-center justify-center px-8 py-16">
			<Typography size="3xl" weight="medium" className="mb-8 w-4/5 max-w-xl text-center md:mb-16">
				{translator.t('section-7.title-1')}
			</Typography>
			<div className="mx-auto flex w-full max-w-7xl flex-wrap gap-2">
				{cards.map((card) => (
					<Card key={card.title} className="theme-blue-v2 mx-auto min-w-80 max-w-md flex-1 rounded-none border-none">
						<CardHeader className="mb-1">
							<Typography size="md" className="opacity-40">
								{card.category}
							</Typography>
							<Typography size="md" weight="medium">
								{card.title}
							</Typography>
						</CardHeader>
						<CardContent className="mb-5 ml-4">
							<ul className="list-disc">
								{card.points.map((point) => {
									return (
										<li key={point.text}>
											<Typography>{point.text}</Typography>
										</li>
									);
								})}
							</ul>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}

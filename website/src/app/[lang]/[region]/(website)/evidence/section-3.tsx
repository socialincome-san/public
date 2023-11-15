import { DefaultPageProps } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import { SectionCard } from './section-card';

type TextFragment = {
	text: string;
	href?: string;
};
type Paragraph = TextFragment[];
type Card = {
	title: string;
	description: string;
	paragraphs: Paragraph[];
};

export default async function Section2({ params }: DefaultPageProps) {
	const section = 3;
	const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['website-evidence'],
	});

	const cards = translator.t<Card[]>(`section-${section}.cards`);
	const takeAction = translator.t('take-action');

	return (
		<BaseContainer backgroundColor="bg-yellow-50" className="mt-12 flex flex-col items-start space-y-1 rounded-sm p-10">
			<Typography size="xl" weight="medium" color="muted-foreground">
				{translator.t(`section-${section}.topic`)}
			</Typography>
			<div className="pb-10">
				<Typography as="span" size="4xl" weight="bold">
					{translator.t(`section-${section}.title-black`)}
				</Typography>
				<Typography as="span" size="4xl" weight="bold" className="text-red-400">
					{translator.t(`section-${section}.title-red`)}
				</Typography>
			</div>
			<div className="my-32 flex space-x-20">
				<Typography size="2xl" weight="semibold" className="w-1/4">
					{translator.t(`section-${section}.evidence`)}
				</Typography>
				<div className="h-fit w-2/5 space-y-10 text-left">
					{cards.map((card, key) => {
						return (
							<SectionCard
								key={key}
								title={card.title}
								description={card.description}
								paragraphs={card.paragraphs}
								takeAction={takeAction}
							/>
						);
					})}
				</div>
			</div>
		</BaseContainer>
	);
}

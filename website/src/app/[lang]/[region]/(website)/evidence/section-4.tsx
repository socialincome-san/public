import { DefaultPageProps } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import { CardTranslation, SectionCard } from './section-card';
import { FontColor } from '@socialincome/ui/src/interfaces/color';

export default async function Section4({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['website-evidence'],
	});
	const cards = translator.t<CardTranslation[]>(`section-4.cards`);
	const takeAction = translator.t('take-action');

	return (
		<BaseContainer backgroundColor="bg-pink-50" className="py-16 px-10 flex flex-col items-start space-y-1 rounded-sm">
			<Typography size="xl" weight="medium" color="muted-foreground">
				{translator.t(`section-4.topic`)}
			</Typography>
			<div className="pb-10">
				{translator.t<{ text: string; color?: FontColor }[]>('section-4.title').map((title, index) => (
					<Typography as="span" key={index} size="4xl" weight="bold" color={title.color}>
						{title.text}
					</Typography>
				))}
			</div>
			<div className="my-32 flex space-x-20">
				<Typography size="2xl" weight="semibold" className="w-1/4">
					{translator.t(`section-4.evidence`)}
				</Typography>
				<div className="h-fit w-2/5 space-y-10 text-left">
					{cards.map((card, key) => (
						<SectionCard key={key} translations={{ card: card, takeAction: takeAction }} />
					))}
				</div>
			</div>
		</BaseContainer>
	);
}

import { DefaultParams } from '@/app/[lang]/[region]';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import { FontColor } from '@socialincome/ui/src/interfaces/color';
import { CardTranslation, SectionCard } from './section-card';

export default async function Section2({ lang }: DefaultParams) {
	const translator = await Translator.getInstance({ language: lang as WebsiteLanguage, namespaces: ['website-arts'] });
	const cards = translator.t<CardTranslation[]>(`section-2.cards`);

	return (
		<BaseContainer baseClassNames="bg-yellow-50" className="flex flex-col space-y-1 py-16 md:px-20">
			<Typography size="xl" weight="medium" color="muted-foreground">
				{translator.t(`section-2.topic`)}
			</Typography>
			<div className="pb-10">
				{translator.t<{ text: string; color?: FontColor }[]>('section-2.title').map((title, index) => (
					<Typography as="span" key={index} size="4xl" weight="bold" color={title.color}>
						{title.text}
					</Typography>
				))}
			</div>
			<div className="mt-32 grid grid-cols-1 gap-y-8 md:grid-cols-2 md:gap-16">
				{cards.map((card, key) => (
					<SectionCard key={key} card={card} />
				))}
			</div>
		</BaseContainer>
	);
}

import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { Typography } from '@socialincome/ui';
import { FontColor } from '@socialincome/ui';
import { CardTranslation, SectionCard } from './section-card';

export default async function Section2({ lang }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang as WebsiteLanguage,
		namespaces: ['website-evidence'],
	});
	const cards = translator.t<CardTranslation[]>(`section-3.cards`);
	const takeAction = translator.t('take-action');

	return (
		<div className="flex flex-col space-y-1 py-16">
			<Typography size="xl" weight="medium" color="muted-foreground">
				{translator.t(`section-3.topic`)}
			</Typography>
			<div className="pb-10">
				{translator.t<{ text: string; color?: FontColor }[]>('section-3.title').map((title, index) => (
					<Typography as="span" key={index} size="4xl" weight="bold" color={title.color}>
						{title.text}
					</Typography>
				))}
			</div>
			<div className="my-32 grid grid-cols-1 gap-16 md:grid-cols-6 lg:grid-cols-8">
				<Typography size="2xl" weight="medium" className="md:col-span-3">
					{translator.t(`section-3.evidence`)}
				</Typography>
				<div className="h-full space-y-10 text-left md:col-span-3 lg:col-span-4">
					{cards.map((card, key) => (
						<SectionCard key={key} translations={{ card: card, takeAction: takeAction }} />
					))}
				</div>
			</div>
		</div>
	);
}

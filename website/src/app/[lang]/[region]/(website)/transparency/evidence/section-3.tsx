import { DefaultParams } from '@/app/[lang]/[region]';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Typography } from '@socialincome/ui';
import { FontColor } from '@socialincome/ui/src/interfaces/color';
import { CardTranslation, SectionCard } from './section-card';

export default async function Section3({ lang }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang as WebsiteLanguage,
		namespaces: ['website-evidence'],
	});
	const cards = translator.t<CardTranslation[]>(`section-4.cards`);

	return (
		<div className="flex flex-col space-y-1 py-16">
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
			<div className="my-32 grid grid-cols-1 gap-16 md:grid-cols-6 lg:grid-cols-8">
				<Typography size="2xl" weight="medium" className="md:col-span-3">
					{translator.t(`section-4.evidence`)}
				</Typography>
				<div className="h-full space-y-10 text-left md:col-span-3 lg:col-span-4">
					{cards.map((card, key) => (
						<SectionCard key={key} translations={{ card: card, takeAction: translator.t('take-action') }} />
					))}
				</div>
			</div>
		</div>
	);
}

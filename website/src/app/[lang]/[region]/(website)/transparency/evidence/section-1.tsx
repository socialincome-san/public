import { DefaultParams } from '@/app/[lang]/[region]';
import { CardTranslation, SectionCard } from '@/app/[lang]/[region]/(website)/transparency/evidence/section-card';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Typography } from '@socialincome/ui';
import { FontColor } from '@socialincome/ui/src/interfaces/color';

export default async function Section1({ lang }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang as WebsiteLanguage,
		namespaces: ['website-evidence'],
	});
	const cards = translator.t<CardTranslation[]>(`section-2.cards`);
	const takeAction = translator.t('take-action');

	return (
		<div className="flex flex-col items-center space-y-24">
			<div className="max-w-3xl space-y-4">
				{translator.t<{ text: string; color?: FontColor }[]>('section-1.title').map((title, index) => (
					<Typography as="span" key={index} size="4xl" weight="bold" color={title.color}>
						{title.text}{' '}
					</Typography>
				))}
				<Typography as="h2" size="xl">
					{translator.t('section-1.subtitle')}
				</Typography>
			</div>
			<div>
				<Typography size="xl" weight="medium" color="muted-foreground">
					{translator.t(`section-2.topic`)}
				</Typography>
				<Typography className="mt-2">
					{translator.t<{ text: string; color?: FontColor }[]>('section-2.title').map((title, index) => (
						<Typography as="span" key={index} size="4xl" weight="bold" color={title.color}>
							{title.text}
						</Typography>
					))}
				</Typography>
				<div className="mb-16 mt-12 grid grid-cols-1 gap-16 md:grid-cols-6 lg:grid-cols-8">
					<Typography size="2xl" weight="medium" className="md:col-span-3">
						{translator.t(`section-2.evidence`)}
					</Typography>
					<div className="h-full space-y-10 text-left md:col-span-3 lg:col-span-4">
						{cards.map((card, key) => (
							<SectionCard key={key} translations={{ card: card, takeAction: takeAction }} />
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

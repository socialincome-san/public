import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import { loadPastDraws } from '@/app/[lang]/[region]/(website)/transparency/random-selection/(sections)/state';
import { FontColor } from '@socialincome/ui/src/interfaces/color';
import { DrawCard } from '@/app/[lang]/[region]/(website)/transparency/random-selection/(components)/draw-card';

export async function PastRounds({ lang }: DefaultParams) {
	const pastDraws = await loadPastDraws();
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-selection'],
	});

	return (
		<BaseContainer className="bg-background mx-auto mb-16 mt-28 md:mb-28 flex flex-col items-center justify-center">
			<div className="mx-auto max-w-2xl mb-4">
				{translator.t<{ text: string; color?: FontColor }[]>('section-4.title').map((title, index) => (
					<Typography key={index} as="span" weight="medium" color={title.color}
											className="text-3xl sm:text-4xl md:text-4xl">
						{title.text}{' '}
					</Typography>
				))}
			</div>
			<div className="space-y-8 mt-4 max-w-3xl">
				<Typography size="xl" className="text-center">
					{translator.t('section-4.past-draws-description')}
				</Typography>
				<div className="mx-auto max-w-3xl space-y-4">
					{pastDraws.map((draw, index) => (
						<DrawCard
							key={index}
							lang={lang}
							draw={draw}
							translations={{
								summary: translator.t('section-4.draw-card.summary', { context: { total: draw.total, count: draw.count } }),
								randomNumber: translator.t('section-4.draw-card.random-number'),
								confirmGithub: translator.t('section-4.draw-card.confirm-github'),
								confirmDrand: translator.t('section-4.draw-card.confirm-drand'),
								people: translator.t('section-4.draw-card.people'),
								longlist: translator.t('section-4.draw-card.long-list', { context: { total: draw.total, count: draw.count } }),
							}}
						/>
					))}
				</div>
			</div>
		</BaseContainer>
	);
}

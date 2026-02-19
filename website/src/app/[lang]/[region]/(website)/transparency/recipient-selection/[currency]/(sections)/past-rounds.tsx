import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { BaseContainer, Typography } from '@socialincome/ui';
import { FontColor } from '@socialincome/ui/src/interfaces/color';
import { DrawCard } from '../(components)/draw-card';
import { loadPastDraws } from './state';

const revalidate = 3600 * 24; // update once a day

export const PastRounds = async ({ lang }: DefaultParams) => {
	const pastDraws = await loadPastDraws();
	const translator = await Translator.getInstance({
		language: lang as WebsiteLanguage,
		namespaces: ['website-selection'],
	});

	return (
		<BaseContainer className="bg-background mx-auto mt-28 mb-16 flex flex-col items-center justify-center md:mb-28">
			<div className="mx-auto mb-4 max-w-2xl">
				{translator.t<{ text: string; color?: FontColor }[]>('section-4.title').map((title, index) => (
					<Typography
						key={index}
						as="span"
						weight="medium"
						color={title.color}
						className="text-3xl sm:text-4xl md:text-4xl"
					>
						{title.text}
					</Typography>
				))}
			</div>
			<div className="mt-4 max-w-3xl space-y-8">
				<Typography size="xl" className="text-center">
					{translator.t('section-4.past-draws-description')}
				</Typography>
				<div className="mx-auto max-w-3xl space-y-4">
					{pastDraws.map((draw, index) => (
						<DrawCard
							key={index}
							lang={lang as WebsiteLanguage}
							draw={draw}
							translations={{
								summary: translator.t('section-4.draw-card.summary', {
									context: { total: draw.total, count: draw.count },
								}),
								randomNumber: translator.t('section-4.draw-card.random-number'),
								confirmGithub: translator.t('section-4.draw-card.confirm-github'),
								confirmDrand: translator.t('section-4.draw-card.confirm-drand'),
								people: translator.t('section-4.draw-card.people'),
								longlist: translator.t('section-4.draw-card.long-list', {
									context: { total: draw.total, count: draw.count },
								}),
							}}
						/>
					))}
				</div>
			</div>
		</BaseContainer>
	);
};

import { WebsiteLanguage } from '@/i18n';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import { FontColor } from '@socialincome/ui/src/interfaces/color';

export async function OurMission({ lang }: { lang: WebsiteLanguage }) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-about-us'],
	});

	return (
		<BaseContainer
			id="our-mission"
			backgroundColor="bg-yellow-50"
			className="flex min-h-screen flex-col justify-center py-16 md:py-32"
		>
			<Typography as="h3" size="xl" color="muted-foreground" className="mb-4">
				{translator.t('our-mission.header')}
			</Typography>
			<p className="mb-8 lg:mb-16">
				{translator.t<{ text: string; color?: FontColor }[]>('our-mission.title').map((title, index) => (
					<Typography as="span" key={index} size="4xl" weight="bold" color={title.color}>
						{title.text}
					</Typography>
				))}
			</p>
			<div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-16">
				<Typography size="2xl" weight="medium">
					{translator.t('our-mission.subtitle')}
				</Typography>
				<div className="flex flex-col space-y-4 md:col-span-2">
					{translator.t<string[]>('our-mission.paragraphs').map((text, index) => (
						<Typography key={index} size="lg">
							{text}
						</Typography>
					))}
				</div>
			</div>
		</BaseContainer>
	);
}

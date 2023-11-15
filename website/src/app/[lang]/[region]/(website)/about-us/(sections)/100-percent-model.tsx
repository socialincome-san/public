import { WebsiteLanguage } from '@/i18n';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import { FontColor } from '@socialincome/ui/src/interfaces/color';

export async function HundredPercentModel({ lang }: { lang: WebsiteLanguage }) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-about-us'],
	});

	return (
		<BaseContainer
			id="100-percent-model"
			backgroundColor="bg-red-50"
			className="flex flex-col justify-center py-16 md:py-32"
		>
			<Typography as="h3" size="xl" color="muted-foreground" className="mb-4">
				{translator.t('100-percent-model.header')}
			</Typography>
			<p className="mb-8 lg:mb-16">
				{translator.t<{ text: string; color?: FontColor }[]>('100-percent-model.title').map((title, index) => (
					<Typography as="span" key={index} size="4xl" weight="bold" color={title.color}>
						{title.text}
					</Typography>
				))}
			</p>
			<div>
				<div className="flex flex-col space-y-4">
					{translator.t<string[]>('100-percent-model.paragraphs').map((text, index) => (
						<Typography dangerouslySetInnerHTML={{ __html: text }} key={index} size="lg" />
					))}
				</div>
			</div>
		</BaseContainer>
	);
}

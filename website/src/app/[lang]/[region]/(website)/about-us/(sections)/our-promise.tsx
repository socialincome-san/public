import { WebsiteLanguage } from '@/i18n';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import { FontColor } from '@socialincome/ui/src/interfaces/color';

export default async function OurPromise({ lang }: { lang: WebsiteLanguage }) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-about-us'],
	});

	return (
		<BaseContainer id="our-promise" className="flex scroll-mt-36 flex-col justify-center">
			<Typography as="h3" size="xl" color="muted-foreground" className="mb-4">
				{translator.t('our-promise.header')}
			</Typography>
			<p className="mb-8 lg:mb-16">
				{translator.t<{ text: string; color?: FontColor }[]>('our-promise.title').map((title, index) => (
					<Typography as="span" key={index} size="4xl" weight="bold" color={title.color}>
						{title.text}
					</Typography>
				))}
			</p>
			<div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-16">
				<Typography
					size="2xl"
					weight="medium"
					className="hyphens-manual"
					dangerouslySetInnerHTML={{ __html: translator.t('our-promise.subtitle') }}
				/>
				<div className="flex flex-col space-y-4 md:col-span-2">
					{translator.t<string[]>('our-promise.paragraphs').map((text, index) => (
						<Typography key={index} size="lg">
							{text}
						</Typography>
					))}
				</div>
			</div>
		</BaseContainer>
	);
}

import { VimeoVideo } from '@/components/vimeo-video';
import { WebsiteLanguage } from '@/i18n';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import { FontColor } from '@socialincome/ui/src/interfaces/color';

export async function FlowOfFunds({ lang }: { lang: WebsiteLanguage }) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-about-us'],
	});

	return (
		<BaseContainer
			id="flow-of-funds"
			backgroundColor="bg-red-50"
			className="flex flex-col justify-center pb-16 md:pb-32"
		>
			<Typography as="h3" size="xl" color="muted-foreground" className="mb-4">
				{translator.t('flow-of-funds.header')}
			</Typography>
			<p className="mb-8 lg:mb-16">
				{translator.t<{ text: string; color?: FontColor }[]>('flow-of-funds.title').map((title, index) => (
					<Typography as="span" key={index} size="4xl" weight="bold" color={title.color}>
						{title.text}
					</Typography>
				))}
			</p>
			<div className="mb-8 flex flex-col space-y-4 lg:mb-16">
				{translator.t<string[]>('flow-of-funds.paragraphs').map((text, index) => (
					<Typography dangerouslySetInnerHTML={{ __html: text }} key={index} size="lg" />
				))}
			</div>
			<div className="mx-auto w-full max-w-3xl">
				<VimeoVideo videoId={translator.t('flow-of-funds.vimeo-video-id')} />
			</div>
		</BaseContainer>
	);
}

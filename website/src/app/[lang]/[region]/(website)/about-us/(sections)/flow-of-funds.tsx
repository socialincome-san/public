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

			<div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-16">
				<div className="space-y-5">
					<div>
						<Typography size="2xl" weight="medium">
							{translator.t('flow-of-funds.subtitle')}
						</Typography>
					</div>
					<div>
						<Typography size="xl" weight="normal">
							{translator.t('flow-of-funds.text')}
						</Typography>
					</div>
				</div>
				<div className="md:col-span-2">
					<div className="flex flex-col space-y-4">
						<div className="mx-auto w-full max-w-3xl">
							<div className="aspect-video overflow-hidden rounded-xl">
								<VimeoVideo videoId={translator.t('flow-of-funds.vimeo-video-id')} />
							</div>
						</div>
					</div>
				</div>
			</div>
		</BaseContainer>
	);
}

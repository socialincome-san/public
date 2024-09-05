import { DefaultParams } from '@/app/[lang]/[region]';
import { VimeoVideo } from '@/components/vimeo-video';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import { FontColor } from '@socialincome/ui/src/interfaces/color';

export async function ExplainerVideo({ lang }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-home2', 'website-videos'],
	});

	return (
		<BaseContainer className="mx-auto my-40 flex w-full flex-col text-center sm:w-3/4 md:w-2/3">
			<Typography size="3xl" weight="medium">
				{translator.t<{ text: string; color?: FontColor }[]>('section-4.title-1').map((title) => (
					<Typography as="span" key={title.text} color={title.color}>
						{title.text}
					</Typography>
				))}
			</Typography>
			<div className="mx-auto mt-16 aspect-video w-72 md:mt-24 md:w-96">
				<VimeoVideo videoId={Number(translator.t('id.video-02'))} />
			</div>
			<Typography color="accent" className="mt-4">
				{translator.t('section-4.cta')}
			</Typography>
		</BaseContainer>
	);
}

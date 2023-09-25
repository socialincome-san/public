import { DefaultPageProps } from '@/app/[lang]/[country]';
import { VimeoVideoComponent } from '@/components/VimeoVideoComponent';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Dialog, DialogContent, DialogTrigger, Typography } from '@socialincome/ui';
import Image from 'next/image';
import phonesGif from './(assets)/phones-1.gif';

export async function SectionOurWork({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['website-our-work'],
	});

	return (
		<BaseContainer className="flex min-h-screen justify-center md:min-h-[calc(100vh-theme(spacing.20))]">
			<Dialog>
				<DialogTrigger className="grid grid-cols-1 items-center md:grid-cols-2">
					<Image className="flex-1 px-16 py-4" src={phonesGif} alt="Change animation" style={{ objectFit: 'cover' }} />
					<p className="md:text-left">
						<Typography as="span" size="4xl" weight="bold">
							{translator?.t('section-our-work.title-1')}
						</Typography>
						<Typography as="span" size="4xl" weight="bold" color="secondary-foreground">
							{translator?.t('section-our-work.title-2')}
						</Typography>
					</p>
				</DialogTrigger>
				<DialogContent className="max-w-screen-lg">
					<VimeoVideoComponent vimeoVideoId={Number(translator.t('section-our-work.vimeo-video-id'))} />
				</DialogContent>
			</Dialog>
		</BaseContainer>
	);
}

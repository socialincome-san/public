import { DefaultPageProps } from '@/app/[lang]/[region]';
import { VimeoVideo } from '@/components/vimeo-video';
import { PlayIcon } from '@heroicons/react/24/solid';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Badge, BaseContainer, Dialog, DialogContent, DialogTrigger, Typography } from '@socialincome/ui';
import Image from 'next/image';
import phonesGif from '../(assets)/phones-1.gif';

export async function OurWork({ params }: DefaultPageProps) {
	const { lang } = await params;
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-our-work', 'website-videos'],
	});

	return (
		<BaseContainer id="mission" className="grid grid-cols-1 content-center items-center gap-16 md:grid-cols-5">
			<div className="mx-auto max-w-lg space-y-5 md:col-span-3">
				<Typography as="span" size="5xl" weight="bold" lineHeight="tight">
					{translator?.t('our-work.title-1')}
				</Typography>
				<Typography as="span" size="5xl" weight="bold" color="secondary" lineHeight="tight">
					{translator?.t('our-work.title-2')}
				</Typography>
				<Typography size="2xl" lineHeight="normal">
					{translator.t('our-work.subtitle')}
				</Typography>
				<div className="pt-5">
					<Dialog>
						<DialogTrigger className="flex cursor-pointer flex-col items-center">
							<Badge variant="interactive-outline">
								<Typography size="md" weight="normal" className="flex items-center p-1">
									<PlayIcon className="group-hover:text-secondary-foreground mr-2 h-5 w-5" />
									{translator.t('our-work.watch')}
								</Typography>
							</Badge>
						</DialogTrigger>
						<DialogContent className="max-w-screen-lg overflow-hidden rounded p-0">
							<VimeoVideo videoId={Number(translator.t('id.video-02'))} videoOptions={{ autoplay: true }} />
						</DialogContent>
					</Dialog>
				</div>
			</div>
			<Image
				className="mx-auto w-full max-w-lg md:order-first md:col-span-2"
				src={phonesGif}
				alt="Change animation"
				style={{ objectFit: 'cover' }}
				unoptimized
			/>
		</BaseContainer>
	);
}

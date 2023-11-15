import { DefaultPageProps } from '@/app/[lang]/[region]';
import { VimeoVideo } from '@/components/vimeo-video';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Dialog, DialogContent, DialogTrigger, Typography } from '@socialincome/ui';
import Image from 'next/image';
import phonesGif from '../(assets)/phones-1.gif';

export async function OurWork({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['website-our-work'],
	});

	return (
		<BaseContainer className="flex min-h-[calc(100vh-theme(spacing.20))] justify-center py-16 md:py-32">
			<Dialog>
				<DialogTrigger className="grid grid-cols-1 items-center lg:grid-cols-2">
					<Image
						className="max-h-96 object-contain px-16 py-4"
						src={phonesGif}
						alt="Change animation"
						style={{ objectFit: 'cover' }}
					/>
					<div className="space-y-4 text-left">
						<p>
							<Typography as="span" size="5xl" weight="bold" lineHeight="tight">
								{translator?.t('our-work.title-1')}
							</Typography>
							<Typography as="span" size="5xl" weight="bold" color="secondary" lineHeight="tight">
								{translator?.t('our-work.title-2')}
							</Typography>
						</p>
						<Typography size="xl">{translator.t('our-work.subtitle')}</Typography>
					</div>
				</DialogTrigger>
				<DialogContent className="max-w-screen-lg">
					<VimeoVideo videoId={Number(translator.t('our-work.vimeo-video-id'))} />
				</DialogContent>
			</Dialog>
		</BaseContainer>
	);
}

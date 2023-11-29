import { DefaultPageProps } from '@/app/[lang]/[region]';
import { VimeoVideo } from '@/components/vimeo-video';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography, Badge, Dialog, DialogTrigger, DialogContent } from "@socialincome/ui";
import Image from 'next/image';
import phonesGif from '../(assets)/phones-1.gif';
import { PlayIcon } from '@heroicons/react/24/solid';

export async function OurWork({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['website-our-work'],
	});

	return (
		<BaseContainer className="min-h-screen-navbar grid grid-cols-1 content-center items-center gap-16 md:grid-cols-5">
			<div className="mx-auto max-w-lg md:col-span-3 space-y-5">
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
					<Badge
						variant="outline"
						className="group hover:bg-primary border border-primary text-primary hover:text-secondary-foreground transition-transform duration-300 hover:scale-105">
						<Typography size="md" weight="normal" className="p-1 flex items-center">
							<PlayIcon className="h-5 w-5 mr-2 text-primary group-hover:text-secondary-foreground" />
							{translator.t('our-work.watch')}
						</Typography>
					</Badge>
						</DialogTrigger>
						<DialogContent className="max-w-screen-lg">
							<VimeoVideo videoId={Number(translator.t('our-work.vimeo-video-id'))} />
						</DialogContent>
					</Dialog>
				</div>
			</div>
			<Image
				className="mx-auto w-full max-w-lg md:order-first md:col-span-2"
				src={phonesGif}
				alt="Change animation"
				style={{ objectFit: 'cover' }}
			/>
		</BaseContainer>
	);
}

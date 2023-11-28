'use client';

import { VimeoVideo } from '@/components/vimeo-video';
import { PlayCircleIcon } from '@heroicons/react/24/outline';
import { BaseContainer, Dialog, DialogContent, DialogTrigger, Typography } from '@socialincome/ui';
import Image from 'next/image';
import houseGif from './(assets)/house.gif';

type Section2Props = {
	vimeoVideoId: number;
	translations: {
		title1: string;
		title2: string;
		subtitle1: string;
		videoButton: string;
	};
};

export function Section2({ vimeoVideoId, translations }: Section2Props) {
	return (
		<BaseContainer
			backgroundColor="bg-yellow-50"
			className="flex flex-col items-center space-y-8 py-20 sm:min-h-screen lg:flex-row"
		>
			<div className="flex flex-1 flex-col justify-center text-left lg:p-8">
				<Typography as="span" size="4xl" weight="bold">
					{translations.title1}
				</Typography>
				<Typography as="span" size="4xl" weight="bold" color="secondary">
					{translations.title2}
				</Typography>
				<Typography size="lg" className="mt-4">
					{translations.subtitle1}
				</Typography>
			</div>
			<div className="flex flex-1 flex-col items-center">
				<Dialog>
					<DialogTrigger className="flex cursor-pointer flex-col items-center">
						<Image
							className="px-16 py-4"
							src={houseGif}
							alt="House Animation for Video Preview"
							style={{ objectFit: 'cover' }}
						/>
						<PlayCircleIcon className="h-8 w-8"></PlayCircleIcon>
						<Typography weight="medium" size="lg">
							{translations.videoButton}
						</Typography>
					</DialogTrigger>
					<DialogContent className="max-w-screen-lg">
						<VimeoVideo videoId={vimeoVideoId} />
					</DialogContent>
				</Dialog>
			</div>
		</BaseContainer>
	);
}

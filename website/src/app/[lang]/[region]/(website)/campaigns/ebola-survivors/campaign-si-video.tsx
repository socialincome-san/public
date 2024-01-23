'use client';

import houseGif from '@/app/[lang]/[region]/(website)/(home)/(assets)/house.gif';
import { VimeoVideo } from '@/components/vimeo-video';
import { WebsiteLanguage } from '@/i18n';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Dialog, DialogContent, DialogTrigger } from '@socialincome/ui';
import Image from 'next/image';

export async function CampaignSiVideo({ lang }: { lang: WebsiteLanguage }) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-campaign-ebola-survivors'],
	});
	const vimeoVideoId1 = Number(translator.t('vimeo-video-id-1'));

	return (
		<BaseContainer className="p-0">
			<div className="flex flex-1 flex-col items-center">
				<Dialog>
					<DialogTrigger className="flex cursor-pointer flex-col items-center">
						<Image
							className="px-16 py-4"
							src={houseGif}
							alt="House Animation for Video Preview"
							style={{ objectFit: 'cover' }}
						/>
					</DialogTrigger>
					<DialogContent className="max-w-screen-lg overflow-hidden rounded p-0">
						<VimeoVideo videoId={vimeoVideoId1} videoOptions={{ autoplay: true }} />
					</DialogContent>
				</Dialog>
			</div>
		</BaseContainer>
	);
}

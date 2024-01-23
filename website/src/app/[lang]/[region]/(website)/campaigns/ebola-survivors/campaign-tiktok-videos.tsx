'use client';

import { WebsiteLanguage } from '@/i18n';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Dialog, DialogContent, DialogTrigger } from "@socialincome/ui";
import { VimeoVideo } from '@/components/vimeo-video';
import Image from "next/image";
import ismatu2 from "@/app/[lang]/[region]/(website)/campaigns/ebola-survivors/(assets)/ismatu-2.gif";
import ismatu3 from "@/app/[lang]/[region]/(website)/campaigns/ebola-survivors/(assets)/ismatu-3.gif";
import ismatu4 from "@/app/[lang]/[region]/(website)/campaigns/ebola-survivors/(assets)/ismatu-4.gif";
import ismatu5 from "@/app/[lang]/[region]/(website)/campaigns/ebola-survivors/(assets)/ismatu-5.gif";
import ismatu6 from "@/app/[lang]/[region]/(website)/campaigns/ebola-survivors/(assets)/ismatu-6.gif";


export async function CampaignTikTokVideos ({ lang }: { lang: WebsiteLanguage }) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-campaign-ebola-survivors'],
	});
	const vimeoVideoId2 = Number(translator.t('vimeo-video-id-2'));
	const vimeoVideoId3 = Number(translator.t('vimeo-video-id-3'));
	const vimeoVideoId4 = Number(translator.t('vimeo-video-id-4'));
	const vimeoVideoId5 = Number(translator.t('vimeo-video-id-5'));
	const vimeoVideoId6 = Number(translator.t('vimeo-video-id-6'));

	return (
		<BaseContainer className="p-0">
			<div className="flex flex-row items-center justify-center w-full">
				{[
					{ src: ismatu2, videoId: vimeoVideoId2 },
					{ src: ismatu3, videoId: vimeoVideoId3 },
					{ src: ismatu4, videoId: vimeoVideoId4 },
					{ src: ismatu5, videoId: vimeoVideoId5 },
					{ src: ismatu6, videoId: vimeoVideoId6 },
				].map(({ src, videoId }, index) => (
					<Dialog key={index}>
						<DialogTrigger className="flex cursor-pointer flex-col items-center">
							<Image
								className="px-0 py-4"
								src={src}
								alt={`Video Preview ${index + 1}`}
								style={{ objectFit: 'cover' }}
							/>
						</DialogTrigger>
						<DialogContent className="max-h-screen-lg overflow-hidden rounded p-0">
							<VimeoVideo videoId={videoId} videoOptions={{ autoplay: true }} />
						</DialogContent>
					</Dialog>
				))}
			</div>
		</BaseContainer>
	);
}

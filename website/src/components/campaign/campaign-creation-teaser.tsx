'use client';

import { BlockWrapper } from '@/components/block-wrapper';
import { Button } from '@/components/button/button';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import NextImage from 'next/image';
import type { SubmissionLabels } from './campaign-submission/types';
import { CreateCampaignDialog } from './create-campaign-dialog';

const backgroundImageSrc = '/assets/campaign/creation-teaser-background.png';

type Props = {
	translations: {
		title: string;
		description: string;
		button: string;
	};
	labels: SubmissionLabels;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const CampaignCreationTeaser = ({ translations, labels, lang, region }: Props) => (
	<BlockWrapper disableMarginTop={true}>
		<CreateCampaignDialog
			labels={labels}
			lang={lang}
			region={region}
			trigger={({ openDialog }) => (
				<section className="bg-accent-foreground relative overflow-hidden rounded-3xl px-6 py-12 md:px-10 md:pt-16 md:pb-14">
					<div aria-hidden className="pointer-events-none absolute inset-0">
						<NextImage
							src={backgroundImageSrc}
							alt=""
							fill
							sizes="(max-width: 768px) 100vw, 1200px"
							className="object-cover object-[70%_center] md:object-[right_center]"
						/>
						<div className="from-accent-foreground/95 via-accent-foreground/80 to-accent-foreground/20 md:from-accent-foreground/95 md:via-accent-foreground/60 absolute inset-0 bg-linear-to-br md:to-transparent" />
						<div className="absolute inset-0 bg-black/20" />
					</div>
					<div className="relative z-10 flex flex-col gap-5">
						<h2 className="text-4xl leading-none font-medium text-pretty text-white">{translations.title}</h2>
						<p className="max-w-[488px] text-base leading-6 text-white">{translations.description}</p>
						<Button type="button" variant="secondary" className="w-fit rounded-full" onClick={openDialog}>
							{translations.button}
						</Button>
					</div>
				</section>
			)}
		/>
	</BlockWrapper>
);
